import ApiResponse from "../../../utils/ApiResponse.js"
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';

export const getCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {
            category: []
        }, 'No Category found'));
        res.json(new ApiResponse(200, rows[0], 'Category retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllCategoriesController = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10, search, pagination = 'true' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM categories';
        const queryParams = [];

        if (status) {
            query += ' WHERE status = ?';
            queryParams.push(status);
        }

        if (search) {
            query += ' WHERE name LIKE ?';
            queryParams.push(`%${search}%`);
        }

        if (pagination === 'true') {
            query += ' ORDER BY sequence LIMIT ? OFFSET ?';
            queryParams.push(parseInt(limit), offset);
        } else {
            query += ' ORDER BY sequence';
        }

        const [rows] = await pool.query(query, queryParams);

        if (pagination === 'true') {
            const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM categories' + (status ? ' WHERE status = ?' : ''), status ? [status] : []);

            if (!rows.length) res.json(new ApiResponse(200, {
                category: []
            }, 'No Category found'));

            const total = totalCount[0].count;
            const totalPages = Math.ceil(total / limit);
            const pagination = {
                currentPage: Number(page),
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: Number(limit)
            };
            res.json(new ApiResponse(200, {
                categories: rows,
                pagination
            }, "Categories retrieved successfully"));
        } else {
            res.json(new ApiResponse(200, {
                categories: rows
            }, "Categories retrieved successfully"));
        }
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const createCategoryController = async (req, res, next) => {
    try {
        const { name, sequence } = req.body;
        let image = null;
        let unselected = null;
        if (req.files) {
            image = req.files['image'] ? `/media/categories/${req.files['image'][0].filename}` : null;
            unselected = req.files['unselected'] ? `/media/categories/${req.files['unselected'][0].filename}` : null;
        }

        const query = 'INSERT INTO categories (name, image, unselected, sequence) VALUES (?, ?, ?, ?)';
        await pool.query(query, [name.trim(), image, unselected, sequence]);

        res.status(201).json(new ApiResponse(201, null, 'Category created successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const updateCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.type;

        if (req.files) {
            if (req.files['image']) {
                updateData.image = `/media/categories/${req.files['image'][0].filename}`;
            }
            if (req.files['unselected']) {
                updateData.unselected = `/media/categories/${req.files['unselected'][0].filename}`;
            }
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE categories SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Category updated successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));

        next(new CustomError(500, error.message));
    }
};


export const deleteCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingCategoryRows] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
        if (!existingCategoryRows.length) throw new CustomError(404, 'Category not found');

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Category deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
