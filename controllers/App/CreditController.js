import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';

export const getCreditPricesController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { status } = req.query;

        const selectQuery = `
            SELECT * from credit_prices WHERE status = ?;
        `;

        let queryParams = [status];

        const [rows] = await connection.query(selectQuery, queryParams);

        if (!rows.length) {
            return res.status(404).json(new ApiResponse(404, [], 'No Credits Prices Found'));
        }

        res.json(new ApiResponse(200, rows, 'Credits Prices fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};
