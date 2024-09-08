import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';

export const getInvoiceDetailsController = async (req, res, next) => {
    try {
        const [invoiceDetails] = await pool.query(`SELECT * FROM invoice_details`);
        res.json(new ApiResponse(200, invoiceDetails[0], 'Invoice details fetched successfully'));
    } catch (error) {
        next(error);
    }
}

export const updateInvoiceDetailsController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { name, gst_number, address, bank_name, account_number, ifsc_code, benificiary_number } = req.body;
        const [invoice_details] = await connection.query(
            `UPDATE invoice_details SET name = ?, gst_number = ?, address = ?, bank_name = ?, account_number = ?, ifsc_code = ?, benificiary_number = ?`,
            [name, gst_number, address, bank_name, account_number, ifsc_code, benificiary_number]
        );

        await connection.commit();
        res.json(new ApiResponse(200, null, 'Invoice details updated successfully'));
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
}