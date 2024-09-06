import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from "../../../utils/CustomError.js"

export const getAllCreditPurchaseController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const limitValue = parseInt(limit, 10);
        const [invoices] = await pool.query(`
                SELECT c.*, u.firstname, u.lastname, u.email FROM credit_invoice AS c JOIN users AS u ON c.user_id = u.user_id LIMIT ? 
            `, [limitValue]);

        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM credit_invoice`, []);

        const totalPages = Math.ceil(totalCount / limit);

        if (!invoices.length) {
            return res.json(new ApiResponse(200, { invoices: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No invoices found'));
        }
        res.json(new ApiResponse(200, {
            invoices: invoices,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};