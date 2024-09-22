import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';

export const getAllUserSubscriptionsController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        let query = `
        SELECT 
            i.id, i.customer_name, i.customer_gstno, i.total_price, i.currency, i.invoice_link, i.transaction_id, i.invoice_date,
            u.user_id, u.firstname, u.lastname, u.email,
            a.address_name, a.address, a.state, a.city, a.pincode, a.phone_number,
            ipd.product_description, ipd.amount, ipd.discount, ipd.taxable_value, ipd.cgst_rate, ipd.cgst_amount, ipd.sgst_rate, ipd.sgst_amount, ipd.igst_rate, ipd.igst_amount, ipd.total_amount, ipd.type, s.type, s.credit_amount, s.duration, s.benefits 
            FROM subscription_invoice i
            JOIN users u ON i.user_id = u.user_id
            JOIN addresses a ON i.address_id = a.id
            LEFT JOIN invoice_product_details ipd ON i.id = ipd.invoice_id AND ipd.type = 'subscription'
            JOIN subscriptions s ON i.subscription_id = s.id 
            ORDER BY i.createdAt DESC
            LIMIT ? OFFSET ?
        `;

        const invoices = await connection.query(query, [parseInt(limit), parseInt(offset)]);

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
                    benefits: invoice.benefits
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