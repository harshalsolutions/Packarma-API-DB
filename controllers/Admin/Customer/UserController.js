import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import { handleError } from "../../../utils/ErrorHandler.js"
import CustomError from "../../../utils/CustomError.js"

export const getAllUsersController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const [users] = await pool.query('SELECT u.*, r.code FROM users as u LEFT JOIN referral_codes as r ON u.user_id = r.user_id ORDER BY u.user_id DESC LIMIT ? OFFSET ?', [Number(limit), (Number(page) - 1) * Number(limit)]);

        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM users`);

        const totalPages = Math.ceil(totalCount / Number(limit));

        if (!users.length) {
            return res.json(new ApiResponse(200, { users: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: Number(limit) } }, 'No users found'));
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
export const getUserWithAddressController = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ? LIMIT ? OFFSET ? ORDER BY created_at DESC', [user_id, limit, (page - 1) * limit]);
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM addresses WHERE user_id = ?`, [user_id]);
        const totalPages = Math.ceil(totalCount / limit);

        if (!addresses.length) {
            return res.json(new ApiResponse(200, { addresses: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No addresses found'));
        }
        delete addresses.password;
        res.json(new ApiResponse(200, {
            addresses: addresses,
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
}

export const getAllUserAddressesController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const [addresses] = await pool.query('SELECT a.*, u.firstname, u.lastname, u.email FROM addresses as a JOIN users as u ON a.user_id = u.user_id ORDER BY a.created_at DESC LIMIT ? OFFSET ?', [Number(limit), (page - 1) * Number(limit)]);
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM addresses`);

        const totalPages = Math.ceil(totalCount / Number(limit));

        if (!addresses.length) {
            return res.json(new ApiResponse(200, { addresses: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: Number(limit) } }, 'No addresses found'));
        }
        res.json(new ApiResponse(200, {
            addresses: addresses,
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

export const AddCreditController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { user_id } = req.params;
        const { credits } = req.body;
        const [user] = await connection.query('UPDATE users SET credits = credits + ? WHERE user_id = ?', [credits, user_id]);
        await connection.query('INSERT INTO credit_history (user_id, change_amount, description) VALUES (?, ?, ?)', [user_id, credits, "Credit added by admin"]);
        if (!user.affectedRows) {
            await connection.rollback();
            return res.json(new ApiResponse(404, {}, 'User not found'));
        }
        await connection.commit();
        res.json(new ApiResponse(200, user, 'Credit added successfully by admin'));
    } catch (error) {
        await connection.rollback();
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
}   