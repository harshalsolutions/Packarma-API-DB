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
