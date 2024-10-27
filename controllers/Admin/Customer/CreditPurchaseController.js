import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import { formatDateTime } from '../../../utils/dateFormatter.js';
import ExcelJS from 'exceljs';

export const getAllCreditPurchaseController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { page = 1, limit = 10, search = '' } = req.query;
    try {
        let query = `
            SELECT 
                i.id, i.customer_name, i.customer_gstno, i.total_price, i.currency, i.invoice_link, i.transaction_id, i.invoice_date,
                u.user_id, u.firstname, u.lastname, u.email,
                a.address_name, a.address, a.state, a.city, a.pincode, a.phone_number,
                ipd.product_description, ipd.amount, ipd.discount, ipd.taxable_value, ipd.cgst_rate, ipd.cgst_amount, ipd.sgst_rate, ipd.sgst_amount, ipd.igst_rate, ipd.igst_amount, ipd.total_amount, ipd.type, i.no_of_credits, i.subscription_id, i.invoice_no, i.type, i.createdAt, i.updatedAt
            FROM customer_invoices i
            JOIN users u ON i.user_id = u.user_id
            JOIN addresses a ON i.address_id = a.id
            LEFT JOIN invoice_product_details ipd ON i.id = ipd.invoice_id AND ipd.type = 'credit'
            WHERE i.type = 'credit'
        `;

        const queryParams = [];
        if (search) {
            query += ` AND (u.firstname LIKE ? OR u.lastname LIKE ?)`;
            const searchValue = `%${search}%`;
            queryParams.push(searchValue, searchValue);
        }

        query += `ORDER BY i.id DESC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt((page - 1) * limit));

        const invoices = await connection.query(query, queryParams);

        const countQuery = `SELECT COUNT(*) as total FROM customer_invoices i
                            JOIN users u ON i.user_id = u.user_id
                            JOIN addresses a ON i.address_id = a.id
                            LEFT JOIN invoice_product_details ipd ON i.id = ipd.invoice_id AND ipd.type = 'credit'
                            WHERE i.type = 'credit'
                            ${search ? `AND (u.firstname LIKE ? OR u.lastname LIKE ?)` : ''}`;
        const countParams = search ? [queryParams[0], queryParams[1]] : [];
        const totalCountResult = await connection.query(countQuery, countParams);
        const totalCount = totalCountResult[0][0].total;

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
                no_of_credits: invoice.no_of_credits,
                customer_name: invoice.customer_name,
                customer_gstno: invoice.customer_gstno,
                total_price: invoice.total_price,
                currency: invoice.currency,
                invoice_link: invoice.invoice_link,
                transaction_id: invoice.transaction_id,
                invoice_date: invoice.invoice_date,
                subscription_id: invoice.subscription_id,
                invoice_no: invoice.invoice_no,
                type: invoice.type,
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
            return formattedInvoice;
        });

        res.json(new ApiResponse(200, {
            invoices: formattedInvoices,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }, 'Credit Purchase Invoices fetched successfully'));
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiResponse(500, 'An error occurred', error.message));
    } finally {
        connection.release();
    }
};

export const exportCreditPurchaseController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { link, search } = req.body
    try {
        const queryParams = [];
        let query = `
            SELECT 
                i.id, i.user_id, i.customer_name, i.total_price, i.currency, i.invoice_date, i.invoice_link,
                u.firstname, u.lastname,
                a.city, a.state, i.no_of_credits, i.transaction_id, i.subscription_id, i.invoice_no, i.type
            FROM customer_invoices i
            JOIN users u ON i.user_id = u.user_id
            JOIN addresses a ON i.address_id = a.id
            WHERE i.type = 'credit'
        `;

        if (search) {
            query += ` AND (u.firstname LIKE ? OR u.lastname LIKE ?)`;
            const searchValue = `%${search}%`;
            queryParams.push(searchValue, searchValue);
        }

        const invoices = await connection.query(query, queryParams);

        const csvData = invoices[0].map(invoice => ({
            id: invoice.id,
            user_id: invoice.user_id,
            user_name: `${invoice.firstname} ${invoice.lastname}`,
            customer_name: invoice.customer_name,
            total_price: invoice.total_price,
            currency: invoice.currency,
            no_of_credits: invoice.no_of_credits,
            city: invoice.city,
            state: invoice.state,
            transaction_id: invoice.transaction_id,
            invoice_link: (link ? link : "") + invoice.invoice_link,
            invoice_date: formatDateTime(invoice.invoice_date),
            invoice_no: invoice.invoice_no,
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Credit Purchase');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'User ID', key: 'user_id', width: 10 },
            { header: 'User Name', key: 'user_name', width: 30 },
            { header: 'Customer Name', key: 'customer_name', width: 30 },
            { header: 'Total Price', key: 'total_price', width: 20 },
            { header: 'Currency', key: 'currency', width: 20 },
            { header: 'No of Credits', key: 'no_of_credits', width: 20 },
            { header: 'City', key: 'city', width: 20 },
            { header: 'State', key: 'state', width: 20 },
            { header: 'Transaction ID', key: 'transaction_id', width: 30 },
            { header: 'Invoice Link', key: 'invoice_link', width: 30 },
            { header: 'Invoice Date', key: 'invoice_date', width: 20 },
            { header: 'Invoice No', key: 'invoice_no', width: 20 },
        ];

        worksheet.addRows(csvData);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`credit_purchase_${new Date().toISOString()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiResponse(500, 'An error occurred', error.message));
    } finally {
        connection.release();
    }
}
