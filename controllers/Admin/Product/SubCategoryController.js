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
        const { category_id, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT subcategories.*, categories.name AS category_name
            FROM subcategories
            LEFT JOIN categories ON subcategories.category_id = categories.id
        `;
        const queryParams = [];

        if (category_id) {
            query += ' WHERE subcategories.category_id = ?';
            queryParams.push(category_id);
        }

        query += ' ORDER BY subcategories.createdAt DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [rows] = await pool.query(query, queryParams);
        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM subcategories' + (category_id ? ' WHERE category_id = ?' : ''), category_id ? [category_id] : []);

        if (!rows.length) res.json(new ApiResponse(200, {
            subcategories: []
        }, 'No Subcategories found'));

        const totalPages = Math.ceil(totalCount[0].count / limit);

        res.json(new ApiResponse(200, {
            subcategories: rows,
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalCount[0].count
        }, 'Subcategories retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const createSubCategoryController = async (req, res, next) => {
    try {
        const { category_id, name } = req.body;
        let image = null;
        if (req.file) {
            image = `/media/subcategories/${req.file.filename}`;
        }

        const query = 'INSERT INTO subcategories (category_id, name, image) VALUES (?, ?, ?)';
        await pool.query(query, [category_id, name, image]);

        res.status(201).json(new ApiResponse(201, null, 'Subcategory created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateSubCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.type;
        if (req.file) {
            const [existingSubCategoryRows] = await pool.query('SELECT image FROM subcategories WHERE id = ?', [id]);
            if (!existingSubCategoryRows.length) throw new CustomError(404, 'Subcategory not found');

            const oldFilePath = existingSubCategoryRows[0].image;
            if (oldFilePath) {
                const absolutePath = path.join(process.cwd(), oldFilePath.replaceAll("/", "\\"));
                unlink(absolutePath, (err) => {
                    if (err) console.error(`Error deleting file: ${err.message}`);
                });
            }

            updateData.image = `/media/subcategories/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE subcategories SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Subcategory updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteSubCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingSubCategoryRows] = await pool.query('SELECT image FROM subcategories WHERE id = ?', [id]);
        if (!existingSubCategoryRows.length) throw new CustomError(404, 'Subcategory not found');

        const oldFilePath = existingSubCategoryRows[0].image;
        if (oldFilePath) {
            const absolutePath = path.join(process.cwd(), oldFilePath.replaceAll("/", "\\"));
            unlink(absolutePath, (err) => {
                if (err) console.error(`Error deleting file: ${err.message}`);
            });
        }

        await pool.query('DELETE FROM subcategories WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Subcategory deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
