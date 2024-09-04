import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';

export const getAllUsersController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const [users] = await pool.query('SELECT * FROM users');
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM users`);

        const totalPages = Math.ceil(totalCount / limit);

        if (!users.length) {
            return res.json(new ApiResponse(200, { users: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No users found'));
        }
        delete users.password;
        res.json(new ApiResponse(200, {
            users: users,
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
