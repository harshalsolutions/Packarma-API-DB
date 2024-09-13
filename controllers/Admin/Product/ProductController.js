import ApiResponse from "../../../utils/ApiResponse.js"
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';

export const getAllProductsController = async (req, res, next) => {
    try {
        const { status, category_id, sub_category_id, product_form_id, packaging_treatment_id, productName, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM product';
        const queryParams = [];

        const conditions = [];

        if (category_id) {
            conditions.push('category_id = ?');
            queryParams.push(category_id);
        }
        if (sub_category_id) {
            conditions.push('sub_category_id = ?');
            queryParams.push(sub_category_id);
        }
        if (product_form_id) {
            conditions.push('product_form_id = ?');
            queryParams.push(product_form_id);
        }
        if (packaging_treatment_id) {
            conditions.push('packaging_treatment_id = ?');
            queryParams.push(packaging_treatment_id);
        }
        if (productName) {
            conditions.push('product_name LIKE ?');
            queryParams.push(`%${productName}%`);
        }
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [rows] = await pool.query(query, queryParams);
        let countQuery = 'SELECT COUNT(*) as count FROM product';
        const countParams = [];
        if (conditions.length > 0) {
            countQuery += ` WHERE ${conditions.join(' AND ')}`;
            countParams.push(...queryParams.slice(0, queryParams.length - 2)); // Avoid limit and offset
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

        res.json(new ApiResponse(200, { products: rows, pagination }, "Products retrieved successfully"));

    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getProductByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [product] = await pool.query('SELECT * FROM product WHERE id = ?', [id]);
        if (!product.length) throw new CustomError(404, 'Product not found');
        res.json(new ApiResponse(200, { product }, 'Product retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const createProductController = async (req, res, next) => {
    try {
        const { product_name, category_id, sub_category_id, product_form_id, packaging_treatment_id, measurement_unit_id } = req.body;
        let product_image = null;
        if (req.file) {
            product_image = `/media/product/${req.file.filename}`;
        }

        const query = 'INSERT INTO product (product_name, category_id, sub_category_id, product_form_id, packaging_treatment_id, measurement_unit_id, product_image) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [product_name, category_id, sub_category_id, product_form_id, packaging_treatment_id, measurement_unit_id, product_image]);

        res.status(201).json(new ApiResponse(201, null, 'Product created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateProductController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.type;

        if (req.file) {
            const [existingProductRows] = await pool.query('SELECT product_image FROM product WHERE id = ?', [id]);
            if (!existingProductRows.length) throw new CustomError(404, 'Product not found');

            const oldFilePath = existingProductRows[0].product_image;
            if (oldFilePath) {
                const absolutePath = path.join(process.cwd(), oldFilePath);
                unlink(absolutePath, (err) => {
                    if (err) console.error(`Error deleting file: ${err.message}`);
                });
            }

            updateData.product_image = `/media/product/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE product SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Product updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteProductController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingProductRows] = await pool.query('SELECT product_image FROM product WHERE id = ?', [id]);
        if (!existingProductRows.length) throw new CustomError(404, 'Product not found');

        const oldFilePath = existingProductRows[0].product_image;
        if (oldFilePath) {
            const absolutePath = path.join(process.cwd(), oldFilePath);
            unlink(absolutePath, (err) => {
                if (err) console.error(`Error deleting file: ${err.message}`);
            });
        }

        await pool.query('DELETE FROM product WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Product deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
