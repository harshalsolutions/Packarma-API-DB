import ApiResponse from "../../../utils/ApiResponse.js"
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { formatDateTime } from "../../../utils/dateFormatter.js";

export const getAllProductsController = async (req, res, next) => {
    try {
        const { status, category_id, sub_category_id, product_form_id, packaging_treatment_id, productName, page = 1, limit = 10, pagination = 'true' } = req.query;
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

        if (pagination === 'true') {
            query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
            queryParams.push(parseInt(limit), offset);
        } else {
            query += ' ORDER BY createdAt DESC';
        }

        const [rows] = await pool.query(query, queryParams);

        if (pagination === 'true') {
            let countQuery = 'SELECT COUNT(*) as count FROM product';
            const countParams = [];
            if (conditions.length > 0) {
                countQuery += ` WHERE ${conditions.join(' AND ')}`;
                countParams.push(...queryParams.slice(0, queryParams.length - 2)); // Avoid limit and offset
            }

            const [totalCount] = await pool.query(countQuery, countParams);
            const total = totalCount[0].count;
            const totalPages = Math.ceil(total / limit);
            const paginationData = {
                currentPage: Number(page),
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: Number(limit)
            };

            res.json(new ApiResponse(200, { products: rows, pagination: paginationData }, "Products retrieved successfully"));
        } else {
            res.json(new ApiResponse(200, { products: rows }, "Products retrieved successfully"));
        }

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
        await pool.query(query, [product_name.trim(), category_id, sub_category_id, product_form_id, packaging_treatment_id, measurement_unit_id, product_image]);

        res.status(201).json(new ApiResponse(201, null, 'Product created successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
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
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
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


export const exportAllProductsController = async (req, res, next) => {
    try {
        const { link } = req.body;
        const [productRows] = await pool.query(`
            SELECT 
                p.id,
                p.product_name,
                c.name AS category_name,
                sc.name AS sub_category_name,
                pf.name AS product_form_name,
                pt.name AS packaging_treatment_name,
                mu.name AS measurement_unit,
                p.status,
                p.createdAt,
                p.updatedAt,
                p.product_image
            FROM 
                product p
            JOIN 
                categories c ON p.category_id = c.id
            JOIN 
                subcategories sc ON p.sub_category_id = sc.id
            JOIN 
                product_form pf ON p.product_form_id = pf.id
            JOIN 
                packaging_treatment pt ON p.packaging_treatment_id = pt.id
            JOIN 
                measurement_unit mu ON p.measurement_unit_id = mu.id
        `);

        if (!productRows.length) throw new CustomError(404, 'No products found');

        const csvData = productRows.map(product => ({
            id: product.id,
            product_name: product.product_name,
            category_name: product.category_name,
            sub_category_name: product.sub_category_name,
            product_form_name: product.product_form_name,
            packaging_treatment_name: product.packaging_treatment_name,
            measurement_unit: product.measurement_unit,
            status: product.status,
            createdAt: formatDateTime(product.createdAt),
            updatedAt: formatDateTime(product.updatedAt),
            image: (link ? link : "") + product.product_image
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('All Products');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Product Name', key: 'product_name', width: 30 },
            { header: 'Image', key: 'image', width: 30 },
            { header: 'Category Name', key: 'category_name', width: 30 },
            { header: 'Sub Category Name', key: 'sub_category_name', width: 30 },
            { header: 'Product Form Name', key: 'product_form_name', width: 30 },
            { header: 'Packaging Treatment Name', key: 'packaging_treatment_name', width: 30 },
            { header: 'Measurement Unit', key: 'measurement_unit', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            {
                header: 'Created At', key: 'createdAt', width: 20
            },
            {
                header: 'Updated At', key: 'updatedAt', width: 20
            },
        ];

        worksheet.addRows(csvData);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`products_${new Date()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error)
        next(error);
    }
};

