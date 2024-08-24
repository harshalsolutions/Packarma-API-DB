import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import { handleError } from "../../utils/ErrorHandler.js"

export const getAddressController = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const [addresses] = await pool.query(
            'SELECT * FROM addresses WHERE user_id = ?',
            [user_id]
        );

        res.status(200).json(new ApiResponse(200, addresses, 'Addresses retrieved successfully'));
    } catch (error) {
        handleError(error, next);
    }
};

export const addAddressController = async (req, res, next) => {
    try {
        const { address_name, building, area } = req.body;
        const userId = req.user.userId
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const insertQuery = `
                INSERT INTO addresses (user_id, address_name, building, area)
                VALUES (?, ?, ?, ?)
            `;
            await connection.query(insertQuery, [userId, address_name, building, area]);
            await connection.commit();
            res.status(201).json(new ApiResponse(201, null, 'Address added successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};
