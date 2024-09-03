import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';

export const createStorageConditionController = async (req, res, next) => {
    try {
        const { name, short_description } = req.body;
        const query = 'INSERT INTO storage_condition (name, short_description) VALUES (?, ?)';
        await pool.query(query, [name, short_description]);
        res.status(201).json(new ApiResponse(201, null, 'Storage Condition created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getStorageConditionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM storage_condition WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {}, 'No Storage Condition found'));

        res.json(new ApiResponse(200, rows[0], 'Storage Condition retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateStorageConditionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const [existingStorageConditionRows] = await pool.query('SELECT * FROM storage_condition WHERE id = ?', [id]);
        if (!existingStorageConditionRows.length) throw new CustomError(404, 'Storage Condition not found');

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE storage_condition SET ${fields}${fields.length ? ', updatedAt = CURRENT_TIMESTAMP' : ''} WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Storage Condition updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteStorageConditionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingStorageConditionRows] = await pool.query('SELECT * FROM storage_condition WHERE id = ?', [id]);
        if (!existingStorageConditionRows.length) throw new CustomError(404, 'Storage Condition not found');

        await pool.query('DELETE FROM storage_condition WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Storage Condition deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllStorageConditionsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query('SELECT * FROM storage_condition ORDER BY createdAt DESC LIMIT ? OFFSET ?', [parseInt(limit), offset]);
        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM storage_condition');

        const total = totalCount[0].count;
        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: Number(page),
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: Number(limit)
        };

        res.json(new ApiResponse(200, { storageConditions: rows, pagination }, "Storage Conditions retrieved successfully"));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};