import CustomError from '../../utils/CustomError.js';
import fs from 'fs';
import path from 'path';
import { totalInWords } from '../../utils/InvoiceUtils.js';
import pool from '../../config/database.js';
import puppeteer from 'puppeteer';
import ApiResponse from '../../utils/ApiResponse.js';
import dotenv from 'dotenv';

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

const addInvoiceToDatabase = async (connection, invoiceType, invoiceData) => {
    try {
        const [day, month, year] = invoiceData.invoice_date.split('/');
        const formattedDate = `${year}-${month}-${day}`;

        const query = `
            INSERT INTO customer_invoices (user_id, customer_name, customer_gstno, total_price, currency, invoice_date, invoice_link, transaction_id, address_id, subscription_id, invoice_no, no_of_credits, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const queryParams = [
            invoiceData.userId, invoiceData.customer_name, invoiceData.customer_gstNo, invoiceData.total_price,
            invoiceData.currency, formattedDate, invoiceData.invoice_link, invoiceData.transaction_id,
            invoiceData.customer_address_id, invoiceData.subscription_id, invoiceData.invoice_no, invoiceData.no_of_credits, invoiceType
        ];
        const [result] = await connection.query(query, queryParams);

        const productDetailsQuery = `
            INSERT INTO invoice_product_details (invoice_id, product_description, amount, discount, taxable_value, cgst_rate, cgst_amount, sgst_rate, sgst_amount, igst_rate, igst_amount, total_amount, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        for (const product of invoiceData.products) {
            const productDetailsParams = [
                result.insertId, product.description, product.amount, product.discount, product.taxable_value,
                product.cgst_rate, product.cgst_amount, product.sgst_rate, product.sgst_amount, product.igst_rate, product.igst_amount, product.total_amount, invoiceType
            ];
            await connection.query(productDetailsQuery, productDetailsParams);
        }

        await connection.commit();

        if (invoiceType === 'subscription') {
            const subscription = await pool.query('SELECT * FROM subscriptions WHERE id = ?', [invoiceData.subscription_id]);
            if (!subscription.length) throw new CustomError(404, 'Subscription not found');
            const subscriptionDetails = subscription[0];
            const startDate = new Date();
            await addUserSubscription(invoiceData.userId, invoiceData.subscription_id, subscriptionDetails[0].duration, startDate, result.insertId);
        }

        if (invoiceType === 'credit') {
            await addUserCredits(invoiceData.userId, invoiceData.no_of_credits);
        }

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new CustomError(409, 'Duplicate entry for transaction ID');
        }
        throw error;
    }
};

const addUserCredits = async (userId, credits) => {
    const description = `You have purchased ${credits} credits`;
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [rows] = await connection.query('SELECT credits FROM users WHERE user_id = ?', [userId]);
            if (!rows.length) throw new CustomError(404, 'User not found');

            const currentCredits = rows[0].credits;
            const newCredits = currentCredits + credits;

            await connection.query('UPDATE users SET credits = ?, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?', [newCredits, userId]);

            await connection.query(
                'INSERT INTO credit_history (user_id, change_amount, description) VALUES (?, ?, ?)',
                [userId, credits, description]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        throw error;
    }
};

const addUserSubscription = async (userId, subscriptionId, duration, startDate, invoiceId) => {
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            const [existingSubscriptions] = await connection.query(
                'SELECT end_date FROM user_subscriptions WHERE user_id = ? ORDER BY end_date DESC LIMIT 1',
                [userId]
            );

            let endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + duration);

            if (existingSubscriptions.length > 0) {
                const lastEndDate = new Date(existingSubscriptions[0].end_date);
                if (lastEndDate > startDate) {
                    startDate = new Date(lastEndDate);
                    startDate.setDate(startDate.getDate() + 1);
                    endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + duration);
                }
            }

            await connection.query(
                'INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date, invoiceId) VALUES (?, ?, ?, ?, ?)',
                [userId, subscriptionId, startDate, endDate, invoiceId]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        throw error;
    }
};


export const generateInvoiceController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { invoice_type } = req.params;
    try {
        const { customer_name, customer_gstNo, products, customer_address_id, transaction_id, no_of_credits, currency, subscription_id } = req.body;
        let today = new Date();
        let day = today.getDate().toString().padStart(2, '0');
        let month = (today.getMonth() + 1).toString().padStart(2, '0');
        let year = today.getFullYear();
        let invoice_date = `${day}/${month}/${year}`;

        const [[invoiceDetails], [result], [address]] = await Promise.all([
            pool.query('SELECT * FROM invoice_details LIMIT 1'),
            pool.query('SELECT COUNT(*) as count FROM invoice_product_details'),
            pool.query(`SELECT * FROM addresses WHERE id = ? LIMIT 1`, [customer_address_id])
        ]);

        if (!address.length) {
            throw new CustomError(500, 'Address not found');
        }

        if (!invoiceDetails.length) {
            throw new CustomError(500, 'Packarma Invoice details not found');
        }
        const details = invoiceDetails[0];
        const invoice_no = result[0].count ? parseInt(result[0].count) + 1 : 1;

        let productRows = '';
        let grand_total = 0;
        let total_cgst = 0;
        let total_sgst = 0;
        let total_igst = 0;
        let total_before_tax = 0;

        products.forEach((product, index) => {
            let tax_rate = address[0].state === 'Maharashtra' ? 0.18 : 0.18;
            const taxable_value = product.amount / (1 + tax_rate);

            let cgst_amount = 0;
            let sgst_amount = 0;
            let igst_amount = 0;

            if (address[0].state === 'Maharashtra') {
                cgst_amount = (taxable_value * 9) / 100;
                sgst_amount = (taxable_value * 9) / 100;
                total_cgst += cgst_amount;
                total_sgst += sgst_amount;
            } else {
                igst_amount = (taxable_value * 18) / 100;
                total_igst += igst_amount;
            }

            const total_product_amount = taxable_value + cgst_amount + sgst_amount + igst_amount;
            grand_total += total_product_amount;
            total_before_tax += taxable_value;

            productRows += `
        <tr style="height: 5rem">
            <td class="table-data">${index + 1}</td>
            <td class="table-data" colspan="4">${product.description}</td>
            <td class="table-data">${product.amount}</td>
            <td class="table-data">${product.discount}</td>
            <td class="table-data">${taxable_value.toFixed(2)}</td>
            <td class="table-data">${address[0].state === "Maharashtra" ? '9%' : ''}</td>
            <td class="table-data">${address[0].state === "Maharashtra" ? cgst_amount.toFixed(2) : ''}</td>
            <td class="table-data">${address[0].state === "Maharashtra" ? '9%' : ''}</td>
            <td class="table-data">${address[0].state === "Maharashtra" ? sgst_amount.toFixed(2) : ''}</td>
            <td class="table-data">${address[0].state !== "Maharashtra" ? '18%' : ''}</td>
            <td class="table-data">${address[0].state !== "Maharashtra" ? igst_amount.toFixed(2) : ''}</td>
            <td class="table-data"><strong>${total_product_amount.toFixed(2)}</strong></td>
        </tr>
    `;
        });

        const parsedTotal = parseFloat(grand_total.toFixed(2));
        const parsedTotalBeforeTax = parseFloat(total_before_tax.toFixed(2));

        const populatedHtml = htmlTemplate
            .replace(/{{invoice_no}}/g, invoice_no)
            .replace(/{{invoice_date}}/g, invoice_date)
            .replace(/{{customer_name}}/g, customer_name)
            .replace(/{{customer_address}}/g, address[0].address)
            .replace(/{{customer_gstin}}/g, customer_gstNo)
            .replaceAll(/{{state}}/g, address[0].state)
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

        await connection.beginTransaction();
        try {
            await addInvoiceToDatabase(connection, invoice_type, {
                invoice_no,
                userId: req.user.userId,
                no_of_credits,
                total_price: parsedTotal,
                currency,
                invoice_date,
                invoice_link: pdfDownloadLink,
                transaction_id,
                customer_name,
                customer_gstNo,
                customer_address_id,
                subscription_id,
                products: products.map(product => ({
                    description: product.description,
                    amount: product.amount,
                    discount: product.discount,
                    taxable_value: product.amount / (1 + (address[0].state === 'Maharashtra' ? 0.18 : 0.18)),
                    cgst_rate: address[0].state === 'Maharashtra' ? 0.09 : 0,
                    cgst_amount: address[0].state === 'Maharashtra' ? ((product.amount / (1 + 0.18)) * 0.09).toFixed(2) : 0,
                    sgst_rate: address[0].state === 'Maharashtra' ? 0.09 : 0,
                    sgst_amount: address[0].state === 'Maharashtra' ? ((product.amount / (1 + 0.18)) * 0.09).toFixed(2) : 0,
                    igst_rate: address[0].state !== 'Maharashtra' ? 0.18 : 0,
                    igst_amount: address[0].state !== 'Maharashtra' ? ((product.amount / (1 + 0.18)) * 0.18).toFixed(2) : 0,
                    total_amount: product.amount,
                }))
            });
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        }

        res.json(new ApiResponse(200, {
            downloadLink: pdfDownloadLink,
            finalAmount: {
                parsedTotal: parsedTotal,
                totalBeforeTax: parsedTotalBeforeTax,
                totalCGST: parseFloat(total_cgst.toFixed(2)),
                totalSGST: parseFloat(total_sgst.toFixed(2)),
                totalIGST: parseFloat(total_igst.toFixed(2))
            }
        }, 'Invoice generated successfully'));

    } catch (error) {
        await connection.rollback();
        res.status(500).json(new ApiResponse(500, {}, error.message));
    } finally {
        connection.release();
    }
};

export const getInvoicesController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const userId = req.user.userId;
    const { type } = req.query;
    try {
        let query = `
            SELECT 
                i.id, i.customer_name, i.customer_gstno, i.total_price, i.currency, i.invoice_link, i.transaction_id, i.invoice_date,
                u.user_id, u.firstname, u.lastname, u.email,
                a.address_name, a.address, a.state, a.city, a.pincode, a.phone_number,
                ipd.product_description, ipd.amount, ipd.discount, ipd.taxable_value, ipd.cgst_rate, ipd.cgst_amount, ipd.sgst_rate, ipd.sgst_amount, ipd.igst_rate, ipd.igst_amount, ipd.total_amount, ipd.type
        `;

        if (type === 'credit') {
            query += `, i.no_of_credits `;
        } else if (type === 'subscription') {
            query += `, s.type, s.credit_amount, s.duration, s.benefits `;
        }

        query += `
            FROM customer_invoices i
            JOIN users u ON i.user_id = u.user_id
            JOIN addresses a ON i.address_id = a.id
            LEFT JOIN invoice_product_details ipd ON i.id = ipd.invoice_id AND ipd.type = ?
        `;

        if (type === 'subscription') {
            query += `JOIN subscriptions s ON i.subscription_id = s.id `;
        }

        query += `WHERE i.user_id = ? AND i.type = ?`;

        const invoices = await connection.query(query, [type, userId, type]);

        const formattedInvoices = invoices[0].map(invoice => {
            const formattedInvoice = {
                id: invoice.id,
                user: {
                    user_id: invoice.user_id,
                    firstname: invoice.firstname,
                    lastname: invoice.lastname,
                    email: invoice.email
                },
                address: {
                    address_id: invoice.address_id,
                    address_name: invoice.address_name,
                    address: invoice.address,
                    state: invoice.state,
                    city: invoice.city,
                    pincode: invoice.pincode,
                    phone_number: invoice.phone_number,
                },
                customer_name: invoice.customer_name,
                customer_gstno: invoice.customer_gstno,
                total_price: invoice.total_price,
                currency: invoice.currency,
                invoice_link: invoice.invoice_link,
                transaction_id: invoice.transaction_id,
                invoice_date: invoice.invoice_date,
                product_details: {
                    product_id: invoice.product_id,
                    invoice_id: invoice.invoice_id,
                    product_description: invoice.product_description,
                    amount: invoice.amount,
                    discount: invoice.discount,
                    taxable_value: invoice.taxable_value,
                    cgst_rate: invoice.cgst_rate,
                    cgst_amount: invoice.cgst_amount,
                    sgst_rate: invoice.sgst_rate,
                    sgst_amount: invoice.sgst_amount,
                    igst_rate: invoice.igst_rate,
                    igst_amount: invoice.igst_amount,
                    total_amount: invoice.total_amount
                },
                createdAt: invoice.createdAt,
                updatedAt: invoice.updatedAt,
            };

            if (type === 'subscription') {
                formattedInvoice.subscription = {
                    subscription_id: invoice.subscription_id,
                    type: invoice.type,
                    credit_amount: invoice.credit_amount,
                    duration: invoice.duration,
                    benefits: invoice.benefits
                };
            } else if (type === 'credit') {
                formattedInvoice.no_of_credits = invoice.no_of_credits;
            }

            return formattedInvoice;
        });

        res.json(new ApiResponse(200, formattedInvoices, 'Invoices fetched successfully'));
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiResponse(500, error.message, 'An error occurred'));
    } finally {
        connection.release();
    }
};

export const getInvoiceByIdController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { id } = req.params;
    const { type } = req.query;
    try {
        let query = `
            SELECT 
                i.id, i.customer_name, i.customer_gstno, i.total_price, i.currency, i.invoice_link, i.transaction_id, i.invoice_date,
                u.user_id, u.firstname, u.lastname, u.email,
                a.address_name, a.address, a.state, a.city, a.pincode, a.phone_number,
                ipd.product_description, ipd.amount, ipd.discount, ipd.taxable_value, ipd.cgst_rate, ipd.cgst_amount, ipd.sgst_rate, ipd.sgst_amount, ipd.igst_rate, ipd.igst_amount, ipd.total_amount, ipd.type
        `;

        if (type === 'credit') {
            query += `, i.no_of_credits `;
        } else if (type === 'subscription') {
            query += `, s.type, s.credit_amount, s.duration, s.benefits `;
        }

        query += `
            FROM customer_invoices i
            JOIN users u ON i.user_id = u.user_id
            JOIN addresses a ON i.address_id = a.id
            LEFT JOIN invoice_product_details ipd ON i.id = ipd.invoice_id AND ipd.type = ?
        `;

        if (type === 'subscription') {
            query += `JOIN subscriptions s ON i.subscription_id = s.id `;
        }

        query += `WHERE i.id = ? AND i.type = ?`;

        const [invoices] = await connection.query(query, [type, id, type]);

        if (invoices.length === 0) {
            return res.status(404).json(new ApiResponse(404, {}, 'Invoice not found'));
        }

        const invoice = invoices[0];
        const formattedInvoice = {
            id: invoice.id,
            user: {
                user_id: invoice.user_id,
                firstname: invoice.firstname,
                lastname: invoice.lastname,
                email: invoice.email
            },
            address: {
                address_id: invoice.address_id,
                address_name: invoice.address_name,
                address: invoice.address,
                state: invoice.state,
                city: invoice.city,
                pincode: invoice.pincode,
                phone_number: invoice.phone_number,
            },
            customer_name: invoice.customer_name,
            customer_gstno: invoice.customer_gstno,
            total_price: invoice.total_price,
            currency: invoice.currency,
            invoice_link: invoice.invoice_link,
            transaction_id: invoice.transaction_id,
            invoice_date: invoice.invoice_date,
            product_details: {
                product_id: invoice.product_id,
                invoice_id: invoice.invoice_id,
                product_description: invoice.product_description,
                amount: invoice.amount,
                discount: invoice.discount,
                taxable_value: invoice.taxable_value,
                cgst_rate: invoice.cgst_rate,
                cgst_amount: invoice.cgst_amount,
                sgst_rate: invoice.sgst_rate,
                sgst_amount: invoice.sgst_amount,
                igst_rate: invoice.igst_rate,
                igst_amount: invoice.igst_amount,
                total_amount: invoice.total_amount
            },
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
        };

        if (type === 'subscription') {
            formattedInvoice.subscription = {
                subscription_id: invoice.subscription_id,
                type: invoice.type,
                credit_amount: invoice.credit_amount,
                duration: invoice.duration,
                benefits: invoice.benefits
            };
        } else if (type === 'credit') {
            formattedInvoice.no_of_credits = invoice.no_of_credits;
        }

        res.json(new ApiResponse(200, formattedInvoice, 'Invoice fetched successfully'));
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiResponse(500, error.message, 'An error occurred'));
    } finally {
        connection.release();
    }
};