import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';

export const getSubCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM subcategories WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {
            subcategories: []
        }, 'No Subcategory found'));

        res.json(new ApiResponse(200, rows[0], 'Subcategory retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllSubCategoriesController = async (req, res, next) => {
    try {
        const { category_id, page = 1, limit = 10, search, status, pagination = 'true' } = req.query;
        const offset = (page - 1) * limit;
        let query = `
            SELECT subcategories.*, categories.name AS category_name
            FROM subcategories
            LEFT JOIN categories ON subcategories.category_id = categories.id
        `;
        const queryParams = [];

        const conditions = [];

        if (status) {
            conditions.push('subcategories.status = ?');
            queryParams.push(status);
        }

        if (category_id) {
            conditions.push('subcategories.category_id = ?');
            queryParams.push(category_id);
        }

        if (search) {
            conditions.push('(subcategories.name LIKE ? OR categories.name LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        if (pagination === 'true') {
            query += ' ORDER BY subcategories.sequence LIMIT ? OFFSET ?';
            queryParams.push(parseInt(limit), offset);
        } else {
            query += ' ORDER BY subcategories.sequence';
        }

        const [rows] = await pool.query(query, queryParams);

        if (pagination === 'true') {
            let countQuery = 'SELECT COUNT(*) as count FROM subcategories LEFT JOIN categories ON subcategories.category_id = categories.id';
            const countParams = [];

            if (conditions.length > 0) {
                countQuery += ` WHERE ${conditions.join(' AND ')}`;
                countParams.push(...queryParams.slice(0, queryParams.length - 2));
            }

            const [totalCount] = await pool.query(countQuery, countParams);
            const total = totalCount[0].count;
            const totalPages = Math.ceil(total / limit);
            const pagination = {
                currentPage: Number(page),
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: Number(limit)
            };

            if (!rows.length) {
                return res.json(new ApiResponse(200, { subcategories: [] }, 'No Subcategories found'));
            }

            res.json(new ApiResponse(200, { subcategories: rows, pagination }, "Subcategories retrieved successfully"));
        } else {
            res.json(new ApiResponse(200, { subcategories: rows }, "Subcategories retrieved successfully"));
        }

    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const createSubCategoryController = async (req, res, next) => {
    try {
        const { category_id, name, sequence } = req.body;
        let image = null;
        if (req.file) {
            image = `/media/subcategories/${req.file.filename}`;
        }

        const query = 'INSERT INTO subcategories (category_id, name, image, sequence) VALUES (?, ?, ?, ?)';
        await pool.query(query, [category_id, name.trim(), image, sequence]);

        res.status(201).json(new ApiResponse(201, null, 'Subcategory created successfully'));
    } catch (error) {
        console.log(error)
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const updateSubCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.type;
        if (req.file) {
            updateData.image = `/media/subcategories/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE subcategories SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Subcategory updated successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const deleteSubCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingSubCategoryRows] = await pool.query('SELECT image FROM subcategories WHERE id = ?', [id]);
        if (!existingSubCategoryRows.length) throw new CustomError(404, 'Subcategory not found');

        await pool.query('DELETE FROM subcategories WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Subcategory deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
