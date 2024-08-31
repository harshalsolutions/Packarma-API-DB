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
        console.log('getPackagingTreatmentsController error:', error);
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
            SELECT 
                p.id AS product_id,
                p.product_name,
                p.category_id,
                c.name AS category_name,
                p.sub_category_id,
                sc.name AS subcategory_name,
                p.product_form_id,
                pf.name AS product_form_name,
                p.packing_treatment_id,
                pt.name AS packing_treatment_name,
                p.measurement_unit_id,
                mu.name AS measurement_unit_name,
                p.product_image,
                p.status,
                p.createdAt,
                p.updatedAt
            FROM product p
            JOIN categories c ON p.category_id = c.id
            JOIN subcategories sc ON p.sub_category_id = sc.id
            JOIN product_form pf ON p.product_form_id = pf.id
            JOIN packing_treatment pt ON p.packing_treatment_id = pt.id
            JOIN measurement_unit mu ON p.measurement_unit_id = mu.id
            WHERE p.sub_category_id = ?
        `;

        const queryParams = [sub_category_id];

        if (status) {
            query += ' AND p.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY product_name';

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No products found');

        res.json(new ApiResponse(200, rows, 'Products fetched successfully'));
    } catch (error) {
        console.log('getProductsController error:', error);
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
        console.log('searchProductSuggestionsController error:', error);
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
        console.log('getPackingTypesController error:', error);
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
        console.log('getShelfLifeOptionsController error:', error);
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
        console.log('getProductWeightOptionsController error:', error);
        next(new CustomError(500, error.message));
    }
};

export const searchPackagingSolutionsController = async (req, res, next) => {
    try {
        const {
            category_id,
            product_id,
            packing_type_id,
            shelf_life_days,
            product_weight,
            grams
        } = req.body;

        const { limit = 10 } = req.query;

        let query = `
            SELECT ps.*, c.name AS category_name, p.product_name
            FROM packaging_solution ps
            JOIN categories c ON ps.product_category_id = c.id
            JOIN product p ON ps.product_id = p.id
            JOIN packaging_material pm ON ps.packaging_material_id = pm.id
            WHERE 1 = 1
        `;

        const queryParams = [];

        if (category_id) {
            query += ' AND ps.product_category_id = ?';
            queryParams.push(category_id);
        }

        if (product_id) {
            query += ' AND ps.product_id = ?';
            queryParams.push(product_id);
        }

        if (packing_type_id) {
            query += ' AND ps.packing_type_id = ?';
            queryParams.push(packing_type_id);
        }

        if (shelf_life_days) {
            query += ' AND ps.display_shelf_life_days >= ?';
            queryParams.push(shelf_life_days);
        }

        if (product_weight) {
            query += ' AND ps.product_min_weight <= ? AND ps.product_max_weight >= ?';
            queryParams.push(product_weight, product_weight);
        }

        if (grams) {
            query += ' AND pm.gsm >= ?';
            queryParams.push(grams);
        }

        query += ' ORDER BY ps.id LIMIT ?';
        queryParams.push(parseInt(limit));

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No packaging solutions found');

        res.json(new ApiResponse(200, rows, 'Packaging solutions fetched successfully'));
    } catch (error) {
        console.log('searchPackagingSolutionsController error:', error);
        next(new CustomError(500, error.message));
    }
};

export const addSearchHistoryController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.user.userId;
        const { packaging_solution_id } = req.body;

        const insertQuery = `
            INSERT INTO search_history (user_id, packaging_solution_id)
            VALUES (?, ?)
        `;

        const [result] = await connection.query(insertQuery, [userId, packaging_solution_id]);

        if (result.affectedRows === 0) {
            throw new CustomError(400, 'Failed to add search history');
        }

        await connection.commit();
        res.json(new ApiResponse(201, null, 'Search history added successfully'));
    } catch (error) {
        await connection.rollback();
        console.log('addSearchHistoryController error:', error);
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};

export const getSearchHistoryController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.user.userId;
        const selectQuery = `
            SELECT sh.*, ps.*, u.firstname, u.lastname
            FROM search_history sh
            JOIN packaging_solution ps ON sh.packaging_solution_id = ps.id
            JOIN users u ON sh.user_id = u.user_id
            WHERE sh.user_id = ?
            ORDER BY sh.search_time DESC
        `;

        const [rows] = await connection.query(selectQuery, [userId]);

        if (!rows.length) {
            throw new CustomError(404, 'No search history found');
        }

        await connection.commit();
        res.json(new ApiResponse(200, rows, 'Search history fetched successfully'));
    } catch (error) {
        await connection.rollback();
        console.log('getSearchHistoryController error:', error);
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};
