import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';

export const getPackagingMachineController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM packaging_machine WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {
            packaging_machine: []
        }, 'No Packaging Machine found'));

        res.json(new ApiResponse(200, rows[0], 'Packaging Machine retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllPackagingMachineController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, pagination = 'true' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT *
            FROM packaging_machine
        `;
        const queryParams = [];

        if (pagination === 'true') {
            query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
            queryParams.push(parseInt(limit), offset);
        } else {
            query += ' ORDER BY createdAt DESC';
        }

        const [rows] = await pool.query(query, queryParams);
        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM packaging_machine');

        if (!rows.length) res.json(new ApiResponse(200, {
            packaging_machine: []
        }, 'No Packaging Machine found'));

        if (pagination === 'true') {
            const total = totalCount[0].count;
            const totalPages = Math.ceil(total / limit);
            const paginationData = {
                currentPage: Number(page),
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: Number(limit)
            };

            res.json(new ApiResponse(200, {
                packaging_machine: rows,
                pagination: paginationData
            }, "Packaging Machine retrieved successfully"));
        } else {
            res.json(new ApiResponse(200, {
                packaging_machine: rows
            }, "Packaging Machine retrieved successfully"));
        }
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const createPackagingMachineController = async (req, res, next) => {
    try {
        const { name, short_description, status } = req.body;
        let image = null;
        if (req.file) {
            image = `/media/packagingmachine/${req.file.filename}`;
        }

        const query = 'INSERT INTO packaging_machine (name, short_description, image, status) VALUES (?, ?, ?, ?)';
        await pool.query(query, [name.trim(), short_description.trim(), image, status]);

        res.status(201).json(new ApiResponse(201, null, 'Packaging Machine created successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const updatePackagingMachineController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.type;
        if (req.file) {
            updateData.image = `/media/packagingmachine/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE packaging_machine SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Packaging Machine updated successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const deletePackagingMachineController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingPackagingMachineRows] = await pool.query('SELECT image FROM packaging_machine WHERE id = ?', [id]);
        if (!existingPackagingMachineRows.length) throw new CustomError(404, 'Packaging Machine not found');

        await pool.query('DELETE FROM packaging_machine WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Packaging Machine deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
