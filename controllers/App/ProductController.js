import pool from '../../config/database.js';
import ApiResponse from '../../utils/ApiResponse.js';
import CustomError from '../../utils/CustomError.js';

export const getCategoryController = async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT c.id AS category_id, c.name AS category_name, c.image AS category_image,
                   s.id AS subcategory_id, s.name AS subcategory_name, s.image AS subcategory_image
            FROM subcategories s
            JOIN categories c ON s.category_id = c.id
        `;

        const queryParams = [];

        if (status) {
            query += ' WHERE s.status = ? AND c.status = ?';
            queryParams.push(status, status);
        }

        query += ' ORDER BY c.name, s.name';

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No categories found');

        const categoriesMap = rows.reduce((acc, row) => {
            const { category_id, category_name, category_image, category_status, subcategory_id, subcategory_name, subcategory_image, subcategory_status } = row;

            if (!acc[category_id]) {
                acc[category_id] = {
                    category_id,
                    category_name,
                    category_image,
                    category_status,
                    subcategories: []
                };
            }

            if (subcategory_id) {
                acc[category_id].subcategories.push({
                    subcategory_id,
                    subcategory_name,
                    subcategory_image,
                    subcategory_status
                });
            }

            return acc;
        }, {});

        const formattedCategories = Object.values(categoriesMap);

        res.json(new ApiResponse(200, formattedCategories, 'Categories fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getPackagingTreatmentsController = async (req, res, next) => {
    try {
        const { status, featured } = req.query;

        let query = 'SELECT * FROM packing_treatment';
        const queryParams = [];

        const conditions = [];
        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }
        if (featured !== undefined) {
            conditions.push('featured = ?');
            queryParams.push(featured === 'true' ? 1 : 0);
        }

        if (conditions.length) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY createdAt DESC';

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No packaging treatments found');

        res.json(new ApiResponse(200, rows, 'Packaging treatments fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getProductsController = async (req, res, next) => {
    try {
        const { sub_category_id, status } = req.query;

        if (!sub_category_id) {
            throw new CustomError(400, 'Subcategory ID is required');
        }

        let query = `
            SELECT id AS product_id, product_name, product_image
            FROM product
            WHERE sub_category_id = ?
        `;

        const queryParams = [sub_category_id];

        if (status) {
            query += ' AND status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY product_name';

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No products found');

        res.json(new ApiResponse(200, rows, 'Products fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const searchProductSuggestionsController = async (req, res, next) => {
    try {
        const { query, limit = 10 } = req.query;

        if (!query) {
            throw new CustomError(400, 'Search query is required');
        }

        let searchQuery = `
            SELECT id AS product_id, product_name, product_image
            FROM product
            WHERE product_name LIKE ? AND status = 'active'
            ORDER BY product_name
            LIMIT ?
        `;

        const searchPattern = `%${query}%`;

        const [rows] = await pool.query(searchQuery, [searchPattern, parseInt(limit)]);

        if (!rows.length) throw new CustomError(404, 'No products found');

        res.json(new ApiResponse(200, rows, 'Product suggestions fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const getPackingTypesController = async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT id AS packing_type_id, name AS packing_type_name, short_description
            FROM packing_type
        `;

        const queryParams = [];

        if (status) {
            query += ' WHERE status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY name';

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No packing types found');

        res.json(new ApiResponse(200, rows, 'Packing types fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getShelfLifeOptionsController = async (req, res, next) => {
    try {
        const { product_id } = req.query;

        if (!product_id) {
            throw new CustomError(400, 'Product ID is required');
        }

        let query = `
            SELECT DISTINCT display_shelf_life_days
            FROM packaging_solution
            WHERE product_id = ?
            ORDER BY display_shelf_life_days
        `;

        const [rows] = await pool.query(query, [product_id]);

        if (!rows.length) throw new CustomError(404, 'No shelf life options found');

        const shelfLifeOptions = rows.map(row => ({
            label: `${row.display_shelf_life_days} Days`,
            value: row.display_shelf_life_days
        }));

        res.json(new ApiResponse(200, shelfLifeOptions, 'Shelf life options fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const getProductWeightOptionsController = async (req, res, next) => {
    try {
        const { product_id } = req.query;

        if (!product_id) {
            throw new CustomError(400, 'Product ID is required');
        }

        let query = `
            SELECT DISTINCT product_min_weight, product_max_weight
            FROM packaging_solution
            WHERE product_id = ?
            ORDER BY product_min_weight
        `;

        const [rows] = await pool.query(query, [product_id]);

        if (!rows.length) throw new CustomError(404, 'No product weight options found');

        const weightOptions = rows.map(row => ({
            min_weight: row.product_min_weight,
            max_weight: row.product_max_weight
        }));

        res.json(new ApiResponse(200, weightOptions, 'Product weight options fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
