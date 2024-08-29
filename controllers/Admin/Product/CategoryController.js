import ApiResponse from "../../../utils/ApiResponse.js"
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import { __dirname } from "../../../app.js";


export const getCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
        if (!rows.length) throw new CustomError(404, 'Category not found');

        res.json(new ApiResponse(200, rows[0], 'Category retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllCategoriesController = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM categories';
        const queryParams = [];

        if (status) {
            query += ' WHERE status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY createdAt DESC';

        query += ' LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [rows] = await pool.query(query, queryParams);
        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM categories' + (status ? ' WHERE status = ?' : ''), status ? [status] : []);

        if (!rows.length) throw new CustomError(404, 'No categories found');

        const totalPages = Math.ceil(totalCount[0].count / limit);

        res.json(new ApiResponse(200, {
            categories: rows,
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalCount[0].count
        }, 'Categories retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const createCategoryController = async (req, res, next) => {
    try {
        const { name } = req.body;
        let image = null;
        if (req.file) {
            image = `/media/categories/${req.file.filename}`;
        }

        const query = 'INSERT INTO categories (name, image) VALUES (?, ?)';
        await pool.query(query, [name, image]);

        res.status(201).json(new ApiResponse(201, null, 'Category created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.type
        if (req.file) {
            const [existingCategoryRows] = await pool.query('SELECT image FROM categories WHERE id = ?', [id]);
            if (!existingCategoryRows.length) throw new CustomError(404, 'Category not found');

            const oldFilePath = existingCategoryRows[0].image;
            if (oldFilePath) {
                const absolutePath = __dirname + oldFilePath.replaceAll("/", "\\");
                unlink(absolutePath, (err) => {
                    if (err) console.error(`Error deleting file: ${err.message}`);
                });
            }

            updateData.image = `/media/categories/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE categories SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Category updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingCategoryRows] = await pool.query('SELECT image FROM categories WHERE id = ?', [id]);
        if (!existingCategoryRows.length) throw new CustomError(404, 'Category not found');

        const oldFilePath = existingCategoryRows[0].image;
        if (oldFilePath) {
            const absolutePath = __dirname + oldFilePath.replaceAll("/", "\\");
            unlink(absolutePath, (err) => {
                if (err) console.error(`Error deleting file: ${err.message}`);
            });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Category deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};