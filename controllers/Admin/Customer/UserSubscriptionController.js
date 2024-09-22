import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import ExcelJS from 'exceljs';
import { formatDateTime } from '../../../utils/dateFormatter.js';


export const getAllUserSubscriptionsController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { page = 1, limit = 10, name, start_date, end_date, subscription_type } = req.query;
        const offset = (page - 1) * limit;
        const queryParams = [];
        let query = `
        SELECT 
            i.id, i.customer_name, i.customer_gstno, i.total_price, i.currency, i.invoice_link, i.transaction_id, i.invoice_date,
            u.user_id, u.firstname, u.lastname, u.email,
            a.address_name, a.address, a.state, a.city, a.pincode, a.phone_number,
            ipd.product_description, ipd.amount, ipd.discount, ipd.taxable_value, ipd.cgst_rate, ipd.cgst_amount, ipd.sgst_rate, ipd.sgst_amount, ipd.igst_rate, ipd.igst_amount, ipd.total_amount, ipd.type, s.type, s.credit_amount, s.duration, s.benefits, us.subscription_id, us.start_date AS us_start_date, us.end_date AS us_end_date
        FROM subscription_invoice i
        JOIN users u ON i.user_id = u.user_id
        JOIN addresses a ON i.address_id = a.id
        LEFT JOIN invoice_product_details ipd ON i.id = ipd.invoice_id AND ipd.type = 'subscription'
        JOIN subscriptions s ON i.subscription_id = s.id 
        JOIN (
            SELECT user_id, subscription_id, start_date, end_date
            FROM user_subscriptions
            WHERE (user_id, start_date) IN (
                SELECT user_id, MAX(start_date)
                FROM user_subscriptions
                GROUP BY user_id
            )
        ) us ON u.user_id = us.user_id
        `;

        let whereClauses = [];

        if (name) {
            whereClauses.push(`(u.firstname LIKE ? OR u.lastname LIKE ?)`);
            queryParams.push(`%${name}%`, `%${name}%`);
        }

        if (start_date && end_date) {
            whereClauses.push(`(us.start_date BETWEEN ? AND ? AND us.end_date BETWEEN ? AND ?)`);
            queryParams.push(start_date, end_date, start_date, end_date);
        }

        if (subscription_type) {
            whereClauses.push(`s.type = ?`);
            queryParams.push(subscription_type);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        query += ` ORDER BY i.createdAt DESC LIMIT ? OFFSET ?`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const invoices = await connection.query(query, queryParams);

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
                subscription: {
                    subscription_id: invoice.subscription_id,
                    type: invoice.type,
                    credit_amount: invoice.credit_amount,
                    duration: invoice.duration,
                    benefits: invoice.benefits,
                    start_date: invoice.us_start_date,
                    end_date: invoice.us_end_date
                },
                createdAt: invoice.createdAt,
                updatedAt: invoice.updatedAt,
            };

            return formattedInvoice;
        });

        const totalCount = invoices[0].length;

        res.json(new ApiResponse(200, {
            invoices: formattedInvoices,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiResponse(500, 'An error occurred', { error: error.message }));
    } finally {
        connection.release();
    }
};

export const getAllSubscriptionController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const [subscriptions] = await connection.query('SELECT * FROM subscriptions');
        res.json(new ApiResponse(200, subscriptions));
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiResponse(500, 'An error occurred', { error: error.message }));
    } finally {
        connection.release();
    }
};


export const exportAllSubscriptionController = async (req, res, next) => {
    try {
        const { link } = req.body;
        const [subscriptionsRows] = await pool.query(`
            SELECT 
            i.id, 
            CONCAT(u.firstname, ' ', u.lastname) AS user_name,
            s.type AS subscription_type,
            us.start_date AS subscription_start_date,
            us.end_date AS subscription_end_date,
            i.transaction_id,
            i.invoice_link,  
            i.invoice_date
        FROM subscription_invoice i
        JOIN users u ON i.user_id = u.user_id
        JOIN subscriptions s ON i.subscription_id = s.id 
        JOIN (
            SELECT user_id, subscription_id, start_date, end_date
            FROM user_subscriptions
            WHERE (user_id, start_date) IN (
                SELECT user_id, MAX(start_date)
                FROM user_subscriptions
                GROUP BY user_id
            )
        ) us ON u.user_id = us.user_id
        `);

        if (!subscriptionsRows.length) throw new CustomError(404, 'No subscriptions found');

        const csvData = subscriptionsRows.map(subscription => ({
            id: subscription.id,
            user_name: subscription.user_name,
            subscription_type: subscription.subscription_type,
            subscription_start_date: formatDateTime(subscription.subscription_start_date),
            subscription_end_date: formatDateTime(subscription.subscription_end_date),
            transaction_id: subscription.transaction_id,
            invoice_link: (link ? link : "") + subscription.invoice_link,
            invoice_date: formatDateTime(subscription.invoice_date),
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('User Subscriptions');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'User Name', key: 'user_name', width: 30 },
            { header: 'Subscription Type', key: 'subscription_type', width: 30 },
            { header: 'Subscription Start Date', key: 'subscription_start_date', width: 20 },
            { header: 'Subscription End Date', key: 'subscription_end_date', width: 20 },
            { header: 'Transaction ID', key: 'transaction_id', width: 30 },
            { header: 'Invoice Link', key: 'invoice_link', width: 30 },
            { header: 'Invoice Date', key: 'invoice_date', width: 20 }
        ];

        worksheet.addRows(csvData);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`user_subscriptions_${new Date().toISOString()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        next(error);
    }
};

