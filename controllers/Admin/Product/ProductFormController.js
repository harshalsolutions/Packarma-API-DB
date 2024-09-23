import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';

export const createProductFormController = async (req, res, next) => {
    try {
        const { name, short_description } = req.body;
        let image = null;
        if (req.file) {
            image = `/media/productform/${req.file.filename}`;
        }

        const query = 'INSERT INTO product_form (name, image, short_description) VALUES (?, ?, ?)';
        await pool.query(query, [name.trim(), image, short_description.trim()]);

        res.status(201).json(new ApiResponse(201, null, 'Product Form created successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const getProductFormController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM product_form WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {}, 'No Product Form found'));

        res.json(new ApiResponse(200, rows[0], 'Product Form retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateProductFormController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.type;
        if (req.file) {
            const [existingProductFormRows] = await pool.query('SELECT image FROM product_form WHERE id = ?', [id]);
            if (!existingProductFormRows.length) throw new CustomError(404, 'Product Form not found');

            const oldFilePath = existingProductFormRows[0].image;
            if (oldFilePath) {
                const absolutePath = path.join(process.cwd(), oldFilePath);
                unlink(absolutePath, (err) => {
                    if (err) console.error(`Error deleting file: ${err.message}`);
                });
            }

            updateData.image = `/media/productform/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE product_form SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Product Form updated successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const deleteProductFormController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingProductFormRows] = await pool.query('SELECT image FROM product_form WHERE id = ?', [id]);
        if (!existingProductFormRows.length) throw new CustomError(404, 'Product Form not found');

        const oldFilePath = existingProductFormRows[0].image;
        if (oldFilePath) {
            const absolutePath = path.join(process.cwd(), oldFilePath);
            unlink(absolutePath, (err) => {
                if (err) console.error(`Error deleting file: ${err.message}`);
            });
        }

        await pool.query('DELETE FROM product_form WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Product Form deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllProductFormsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, pagination = 'true' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM product_form ORDER BY createdAt DESC';
        const queryParams = [];

        if (pagination === 'true') {
            query += ' LIMIT ? OFFSET ?';
            queryParams.push(parseInt(limit), offset);
        }

        const [rows] = await pool.query(query, queryParams);
        if (pagination === 'true') {
            const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM product_form');

            const total = totalCount[0].count;
            const totalPages = Math.ceil(total / limit);
            const pagination = {
                currentPage: Number(page),
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: Number(limit)
            };

            res.json(new ApiResponse(200, { productForms: rows, pagination }, "Product Forms retrieved successfully"));
        } else {
            res.json(new ApiResponse(200, { productForms: rows }, "Product Forms retrieved successfully"));
        }

    } catch (error) {
        next(new CustomError(500, error.message));
    }
};