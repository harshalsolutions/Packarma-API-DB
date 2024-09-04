import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import { handleError } from "../../../utils/ErrorHandler.js"
import CustomError from "../../../utils/CustomError.js"

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

export const getAllUserAddressesController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const [addresses] = await pool.query('SELECT a.*, u.firstname, u.lastname, u.email FROM addresses as a JOIN users as u ON a.user_id = u.user_id');
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM addresses`);

        const totalPages = Math.ceil(totalCount / limit);

        if (!addresses.length) {
            return res.json(new ApiResponse(200, { addresses: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No addresses found'));
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