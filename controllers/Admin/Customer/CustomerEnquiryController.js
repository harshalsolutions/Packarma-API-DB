import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from "../../../utils/CustomError.js"

export const getAllCustomerEnquiryController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const limitValue = parseInt(limit, 10);
        const [enquiries] = await pool.query(`
                SELECT * from help_support; 
            `, [limitValue]);

        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM help_support`, []);

        const totalPages = Math.ceil(totalCount / limit);

        if (!enquiries.length) {
            return res.json(new ApiResponse(200, { enquiries: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No invoices found'));
        }
        res.json(new ApiResponse(200, {
            enquiries: enquiries,
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