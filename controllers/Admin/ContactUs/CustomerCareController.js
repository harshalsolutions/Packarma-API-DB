import pool from '../../../config/database.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import CustomError from '../../../utils/CustomError.js';

export const getCustomerCareController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT hs.*, a.name AS admin_name
            FROM help_support AS hs
            LEFT JOIN admin AS a ON hs.admin_id = a.id
            WHERE hs.name LIKE ? OR hs.phone_number LIKE ?
            ORDER BY hs.createdAt DESC 
            LIMIT ? OFFSET ?
        `;

        const queryParams = [`%${search}%`, `%${search}%`, parseInt(limit), parseInt(offset)];

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


export const updateAdminDescriptionForEnquiryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { admin_description } = req.body;
        if (!id || !admin_description) throw new CustomError(400, 'Please provide id and admin_description');

        await pool.query('UPDATE help_support SET admin_description = ?, admin_id = ? WHERE id = ?', [admin_description, req.user.adminId, id]);

        res.json(new ApiResponse(200, null, 'Admin description updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

