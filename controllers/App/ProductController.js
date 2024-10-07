import pool from '../../config/database.js';
import ApiResponse from '../../utils/ApiResponse.js';
import CustomError from '../../utils/CustomError.js';

export const getCategoryController = async (req, res, next) => {
    try {
        const { status = "active" } = req.query;

        let query = `
            SELECT c.id AS category_id, c.name AS category_name, c.unselected AS unselected_category_image, c.image AS category_image, c.sequence AS category_sequence,
                   s.id AS subcategory_id, s.name AS subcategory_name, s.image AS subcategory_image, s.sequence AS subcategory_sequence
            FROM subcategories s
            JOIN categories c ON s.category_id = c.id
        `;

        const queryParams = [];

        if (status) {
            query += ' WHERE s.status = ? AND c.status = ?';
            queryParams.push(status, status);
        }

        query += ' ORDER BY c.sequence, s.sequence';

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No categories found');

        const categoriesMap = rows.reduce((acc, row) => {
            const { category_id, category_name, category_image, unselected_category_image, category_sequence, subcategory_id, subcategory_name, subcategory_image, subcategory_sequence } = row;

            if (!acc[category_id]) {
                acc[category_id] = {
                    category_id,
                    category_name,
                    unselected_category_image,
                    category_image,
                    category_sequence,
                    subcategories: []
                };
            }

            if (subcategory_id) {
                acc[category_id].subcategories.push({
                    subcategory_id,
                    subcategory_name,
                    subcategory_image,
                    subcategory_sequence
                });
            }

            return acc;
        }, {});

        const formattedCategories = Object.values(categoriesMap).sort((a, b) => a.category_sequence - b.category_sequence);

        formattedCategories.forEach(category => {
            category.subcategories.sort((a, b) => a.subcategory_sequence - b.subcategory_sequence);
        });

        res.json(new ApiResponse(200, formattedCategories, 'Categories fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getPackagingTreatmentsController = async (req, res, next) => {
    try {
        const { status = "active", featured } = req.query;

        let query = 'SELECT * FROM packaging_treatment';
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
        const { sub_category_id, status = "active" } = req.query;

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
                p.packaging_treatment_id,
                pt.name AS packaging_treatment_name,
                p.measurement_unit_id,
                mu.name AS measurement_unit_name,
                mu.symbol AS measurement_unit_symbol,
                p.product_image,
                p.status,
                p.createdAt,
                p.updatedAt
            FROM product p
            JOIN categories c ON p.category_id = c.id
            JOIN subcategories sc ON p.sub_category_id = sc.id
            JOIN product_form pf ON p.product_form_id = pf.id
            JOIN packaging_treatment pt ON p.packaging_treatment_id = pt.id
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

        if (!rows.length) {
            return res.json(new ApiResponse(200, null, 'No products found'));
        }

        res.json(new ApiResponse(200, rows, 'Products fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const searchProductSuggestionsController = async (req, res, next) => {
    try {
        const { query, limit = 10, product } = req.query;

        if (!query) {
            throw new CustomError(400, 'Search query is required');
        }

        let searchQuery;
        let queryParams;

        if (product === 'true') {
            searchQuery = 'SELECT p.*, sc.name AS subcategory_name FROM product AS p JOIN subcategories AS sc ON p.sub_category_id = sc.id WHERE product_name LIKE ? AND p.status = ? ORDER BY product_name LIMIT ?';
            queryParams = [`%${query.trim()}%`, 'active', parseInt(limit)];
        } else {
            searchQuery = `
            SELECT p.*, sc.name AS subcategory_name
            FROM product AS p
            JOIN subcategories AS sc ON p.sub_category_id = sc.id
            WHERE sc.name LIKE ? AND p.status = 'active'
        `;

            const searchPattern = `%${query.trim()}%`;
            queryParams = [searchPattern];

            const [subCategoryMatchRows] = await pool.query(searchQuery, queryParams);

            if (subCategoryMatchRows.length > 0) {
                searchQuery = 'SELECT p.*, sc.name AS subcategory_name FROM product AS p JOIN subcategories AS sc ON p.sub_category_id = sc.id WHERE p.sub_category_id = ? AND p.status = ? ORDER BY product_name LIMIT ?';
                queryParams = [subCategoryMatchRows[0].sub_category_id, 'active', parseInt(limit)];
            } else {
                searchQuery = 'SELECT p.*, sc.name AS subcategory_name FROM product AS p JOIN subcategories AS sc ON p.sub_category_id = sc.id WHERE product_name LIKE ? AND p.status = ? ORDER BY product_name LIMIT ?';
                queryParams = [searchPattern, 'active', parseInt(limit)];
            }
        }

        const [rows] = await pool.query(searchQuery, queryParams);

        if (!rows.length) {
            return res.json(new ApiResponse(200, [], 'No product suggestions found'));
        }
        res.json(new ApiResponse(200, rows, 'Product suggestions fetched successfully'));

    } catch (error) {
        console.error(error);
        next(new CustomError(500, error.message));
    }
};

export const getPackingTypesController = async (req, res, next) => {
    try {
        const { status = "active" } = req.query;

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
            WHERE product_id = ? AND packing_type_id = 1 AND status = "active"
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
            WHERE product_id = ? AND packing_type_id = 1 AND status = "active"
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

export const getSearchHistoryController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.user.userId;
        const selectQuery = `   
                SELECT 
                sh.*,
                ps.name,
                ps.structure_type,
                ps.sequence,
                ps.storage_condition_id,
                ps.display_shelf_life_days,
                ps.product_id,
                ps.product_category_id,
                ps.product_form_id,
                ps.packaging_treatment_id,
                ps.packing_type_id,
                ps.packaging_machine_id,
                ps.packaging_material_id,
                ps.min_order_quantity,
                ps.min_order_quantity_unit_id,
                ps.image,
                ps.status,
                u.firstname,
                u.lastname,
                c.name AS category_name,
                sc.name AS subcategory_name,
                sc.id AS subcategory_id,
                p.product_name,
                pt.name AS packing_type_name
            FROM 
                search_history sh
            JOIN 
                packaging_solution ps ON sh.packaging_solution_id = ps.id
            JOIN 
                users u ON sh.user_id = u.user_id
            JOIN 
                product p ON ps.product_id = p.id
            JOIN 
                categories c ON p.category_id = c.id
            JOIN 
                subcategories sc ON p.sub_category_id = sc.id
            JOIN 
                packing_type pt ON ps.packing_type_id = pt.id
            WHERE 
                sh.user_id = ? 
            ORDER BY sh.search_time DESC, sh.id DESC;
        `;

        const [rows] = await connection.query(selectQuery, [userId]);

        if (!rows.length) {
            throw new CustomError(404, 'No search history found');
        }

        await connection.commit();
        res.json(new ApiResponse(200, rows, 'Search history fetched successfully'));
    } catch (error) {
        await connection.rollback();
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};

export const getSubCategoryByPackagingTreatmentController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const { id } = req.params;

    try {
        const selectQuery = `
            SELECT DISTINCT s.*
            FROM subcategories s
            JOIN product p ON s.id = p.sub_category_id
            WHERE p.packaging_treatment_id = ?
            ORDER BY s.sequence;  
        `;

        const [rows] = await connection.query(selectQuery, [id]);

        if (!rows.length) {
            return res.status(404).json(new ApiResponse(404, [], 'No subcategories found for the specified packaging treatment'));
        }

        res.json(new ApiResponse(200, rows, 'Subcategories fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};

