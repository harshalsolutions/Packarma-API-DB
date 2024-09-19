import { handleError } from '../../utils/ErrorHandler.js';
import CustomError from '../../utils/CustomError.js';
import fs from 'fs';
import path from 'path';
import { totalInWords } from '../../utils/InvoiceUtils.js';
import pool from '../../config/database.js';
import puppeteer from 'puppeteer';
import ApiResponse from '../../utils/ApiResponse.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const htmlPath = path.join(process.cwd(), 'utils/invoice.html');
const htmlTemplate = fs.readFileSync(htmlPath, 'utf8');

let browser;

const getBrowserInstance = async () => {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browser;
};

export const generateInvoiceController = async (req, res, next) => {
    try {
        const { customer_name, customer_gstin, state, products, customer_address, transaction_id } = req.body;

        let today = new Date();
        let day = today.getDate().toString().padStart(2, '0');
        let month = (today.getMonth() + 1).toString().padStart(2, '0');
        let year = today.getFullYear();
        let invoice_date = `${day}/${month}/${year}`;

        const [[invoiceDetails], [result], [address]] = await Promise.all([
            pool.query('SELECT * FROM invoice_details LIMIT 1'),
            pool.query('SELECT MAX(id) as maxId FROM credit_invoice'),
            pool.query(`SELECT * FROM addresses WHERE id = ? LIMIT 1`, [customer_address])
        ]);


        if (!invoiceDetails.length) {
            throw new CustomError(500, 'Invoice details not found');
        }
        const details = invoiceDetails[0];
        const invoice_no = result[0].maxId ? result[0].maxId + 1 : 1;

        let productRows = '';
        let grand_total = 0;
        products.forEach((product, index) => {
            grand_total += product.total;
            productRows += `
                <tr style="height: 5rem">
                    <td class="table-data">${index + 1}</td>
                    <td class="table-data" colspan="4">${product.description}</td>
                    <td class="table-data">${product.amount}</td>
                    <td class="table-data">${product.discount}</td>
                    <td class="table-data">${product.taxable_value}</td>
                    <td class="table-data">${state === "Maharashtra" ? product.cgst_rate : ""}</td>
                    <td class="table-data">${state === "Maharashtra" ? product.cgst_amount : ""}</td>
                    <td class="table-data">${state === "Maharashtra" ? product.sgst_rate : ""}</td>
                    <td class="table-data">${state === "Maharashtra" ? product.sgst_amount : ""}</td>
                    <td class="table-data">${state !== "Maharashtra" ? product.igst_rate : ""}</td>
                    <td class="table-data">${state !== "Maharashtra" ? product.igst_amount : ""}</td>
                    <td class="table-data"><strong>${product.total}</strong></td>
                </tr>
            `;
        });

        const parsedTotal = parseFloat(grand_total.toFixed(2));

        const populatedHtml = htmlTemplate
            .replace(/{{invoice_no}}/g, invoice_no)
            .replace(/{{invoice_date}}/g, invoice_date)
            .replace(/{{customer_name}}/g, customer_name)
            .replace(/{{customer_address}}/g, address[0].building + ", " + address[0].area)
            .replace(/{{customer_gstin}}/g, customer_gstin)
            .replaceAll(/{{state}}/g, state)
            .replace(/{{grand_total}}/g, parsedTotal)
            .replace(/{{total_in_words}}/g, totalInWords(parsedTotal))
            .replace('{{PRODUCT_ROWS}}', productRows)
            .replace(/{{name}}/g, details.name)
            .replace(/{{gst_number}}/g, details.gst_number)
            .replace(/{{address}}/g, details.address)
            .replace(/{{bank_name}}/g, details.bank_name)
            .replace(/{{account_number}}/g, details.account_number)
            .replace(/{{ifsc_code}}/g, details.ifsc_code)
            .replace(/{{benificiary_number}}/g, details.benificiary_number)
            .replace(/{{transaction_id}}/g, transaction_id);

        const pdfFolder = path.join(process.cwd(), 'invoices');

        if (!fs.existsSync(pdfFolder)) {
            fs.mkdirSync(pdfFolder);
        }

        const pdfFilePath = path.join(pdfFolder, `invoice_${invoice_no}.pdf`);

        const browser = await getBrowserInstance();
        const page = await browser.newPage();
        await page.setContent(populatedHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await page.close();

        fs.writeFileSync(pdfFilePath, pdfBuffer);

        const pdfDownloadLink = `/invoices/${path.basename(pdfFilePath)}`;

        res.json({
            success: true,
            message: 'Invoice generated successfully',
            downloadLink: pdfDownloadLink
        });
    } catch (error) {
        handleError(error, next);
    }
};

export const getCreditInvoicesController = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        let query = `
            SELECT *
            FROM credit_invoice 
        `;
        const queryParams = [];

        if (userId) {
            query += ' WHERE user_id = ?';
            queryParams.push(userId);
        }

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) {
            return res.json(new ApiResponse(200, null, 'No credit invoices found'));
        }

        res.json(new ApiResponse(200, rows, 'Credit invoices fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

async function convertToINR(amount, fromCurrency) {
    try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_EXCHANGE_API_KEY}/latest/${fromCurrency}`);
        const conversionRate = response.data.conversion_rates.INR;
        return amount * conversionRate;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        throw new Error('Failed to convert currency');
    }
}

export const addCreditInvoiceController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const userId = req.user.userId;

    try {
        const { number_of_credits, total_price, currency, invoice_date, invoice_link } = req.body;

        if (!userId || !number_of_credits || !total_price || !currency || !invoice_date || !invoice_link) {
            throw new CustomError(400, 'All fields are required');
        }

        let indian_price;
        if (currency === 'INR') {
            indian_price = total_price;
        } else {
            indian_price = await convertToINR(total_price, currency);
        }
        await connection.beginTransaction();

        const query = `
            INSERT INTO credit_invoice (user_id, number_of_credits, total_price, currency, indian_price, invoice_date, invoice_link)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const queryParams = [userId, number_of_credits, total_price, currency, indian_price, invoice_date, invoice_link];

        await connection.query(query, queryParams);

        await connection.commit();

        res.json(new ApiResponse(200, {}, 'Credit invoice added successfully'));
    } catch (error) {
        await connection.rollback();
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};


export const getSubscriptionInvoicesController = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        let query = `
            SELECT si.*, s.* 
            FROM subscription_invoice AS si 
            JOIN subscriptions AS s ON si.subscription_id = s.id
        `;
        const queryParams = [];

        if (userId) {
            query += ' WHERE user_id = ?';
            queryParams.push(userId);
        }

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No subscription invoices found');

        res.json(new ApiResponse(200, rows, 'Subscription invoices fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const addSubscriptionInvoiceController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const userId = req.user.userId;

    try {
        const { subscription_id, invoice_date, invoice_link, total_price, currency } = req.body;
        if (!userId || !subscription_id || !total_price || !invoice_date || !currency || !invoice_link) {
            throw new CustomError(400, 'All fields are required');
        }
        await connection.beginTransaction();
        const query = `
            INSERT INTO subscription_invoice (user_id, subscription_id, total_price, indian_price, invoice_date, invoice_link, currency)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        let indian_price;
        if (currency === 'INR') {
            indian_price = total_price;
        } else {
            indian_price = await convertToINR(total_price, currency);
        }

        const queryParams = [userId, subscription_id, total_price, indian_price, invoice_date, invoice_link, currency];

        await connection.query(query, queryParams);

        await connection.commit();

        res.json(new ApiResponse(200, {}, 'Subscription invoice added successfully'));
    } catch (error) {
        console.log(error)
        await connection.rollback();
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};

