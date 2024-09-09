import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';

export const getCreditMasterController = async (req, res, next) => {
    try {
        const query = 'SELECT credit_price, credit_percentage FROM CustomerGeneralSettings LIMIT 1';
        const [rows] = await pool.query(query);

        if (!rows.length) throw new CustomError(404, 'Credit Master not found');

        res.json(new ApiResponse(200, rows[0]));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateCreditMasterController = async (req, res, next) => {
    try {
        const { credit_price, credit_percentage } = req.body;

        const query = `
            UPDATE CustomerGeneralSettings 
            SET credit_price = ?, credit_percentage = ?
            WHERE id = 1
        `;
        const [result] = await pool.query(query, [credit_price, credit_percentage]);

        if (result.affectedRows === 0) throw new CustomError(404, 'Credit Master not found');

        res.json(new ApiResponse(200, null, 'Credit Master updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};