import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import { handleError } from "../../utils/ErrorHandler.js"
import CustomError from '../../utils/CustomError.js';

export const getAddressController = async (req, res, next) => {
    try {
        const userId = req.user.userId
        const [addresses] = await pool.query(
            'SELECT * FROM addresses WHERE user_id = ?',
            [userId]
        );

        if (!addresses.length) {
            return res.json(new ApiResponse(200, null, 'No addresses found'));
        }

        res.status(200).json(new ApiResponse(200, addresses, 'Addresses retrieved successfully'));
    } catch (error) {
        handleError(error, next);
    }
};

export const addAddressController = async (req, res, next) => {
    try {
        const { address, state, city, pincode, address_name } = req.body;
        const userId = req.user.userId
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const findQuery = `
                SELECT COUNT(*) as total_count
                FROM addresses
                WHERE user_id = ?
            `;
            const [[{ total_count }]] = await connection.query(findQuery, [userId]);

            const addName = address_name || `Address ${total_count + 1}`;

            const insertQuery = `
                INSERT INTO addresses (user_id, address_name, address, state, city, pincode)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await connection.query(insertQuery, [userId, addName, address, state, city, pincode]);
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


export const updateAddressController = async (req, res, next) => {
    try {
        const { address_id } = req.params;
        const userId = req.user.userId;

        if (!address_id) throw new CustomError(400, 'Address ID is required');

        const fieldsToUpdate = req.body;
        const setClause = Object.keys(fieldsToUpdate)
            .map(key => `${key} = ?`)
            .join(', ');

        if (!setClause) throw new CustomError(400, 'No fields to update');

        const values = Object.values(fieldsToUpdate);
        values.push(address_id, userId);

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const updateQuery = `
                UPDATE addresses
                SET ${setClause}
                WHERE id = ? AND user_id = ?
            `;
            const [result] = await connection.query(updateQuery, values);

            if (result.affectedRows === 0) throw new CustomError(404, 'Address not found or not owned by user');

            await connection.commit();
            res.status(200).json(new ApiResponse(200, null, 'Address updated successfully'));
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

export const deleteAddressController = async (req, res, next) => {
    try {
        const { address_id } = req.params
        const userId = req.user.userId;

        if (!address_id) throw new CustomError(400, 'Address ID is required');

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const deleteQuery = `
                DELETE FROM addresses
                WHERE id = ? AND user_id = ?
            `;
            const [result] = await connection.query(deleteQuery, [address_id, userId]);

            if (result.affectedRows === 0) throw new CustomError(404, 'Address not found or not owned by user');

            await connection.commit();
            res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully'));
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


