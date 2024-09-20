import pool from '../../../config/database.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import CustomError from '../../../utils/CustomError.js';

export const getCustomerCareController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT *
            FROM help_support 
            WHERE name LIKE ? OR phone_number LIKE ?
            ORDER BY createdAt DESC 
            LIMIT ${limit} OFFSET ${offset}
        `;

        const queryParams = [`%${search}%`, `%${search}%`];

        const [enquiries] = await pool.query(query, queryParams);

        if (!enquiries.length) throw new CustomError(404, 'No help and support messages found');

        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM help_support WHERE name LIKE ? OR phone_number LIKE ?`, queryParams);
        const totalPages = Math.ceil(totalCount / limit);

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

