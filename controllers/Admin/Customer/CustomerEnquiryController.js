import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from "../../../utils/CustomError.js"

export const getAllCustomerEnquiryController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, userId, userName, status, productName, category, subCategory, fromDate, toDate } = req.query;
        const offset = (page - 1) * limit;
        console.log(req.query)
        let query = `
            SELECT sh.id, sh.user_id, sh.packaging_solution_id, sh.search_time, 
            ps.name, ps.image, ps.structure_type, ps.sequence, ps.storage_condition_id, ps.display_shelf_life_days, ps.product_id, ps.product_category_id, ps.product_form_id, 
            ps.packaging_treatment_id, ps.packing_type_id, pt.name AS packing_type_name, ps.packaging_machine_id, ps.packaging_material_id, ps.product_min_weight, ps.product_max_weight, 
            ps.min_order_quantity, ps.min_order_quantity_unit_id, ps.status, 
            u.firstname, u.lastname,
            p.product_name, c.name AS category_name, sc.id AS subcategory_id,  sc.name AS subcategory_name, pf.name AS product_form_name, pt.name AS packaging_treatment_name
            FROM search_history sh
            JOIN packaging_solution ps ON sh.packaging_solution_id = ps.id
            JOIN product p ON ps.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            JOIN subcategories sc ON p.sub_category_id = sc.id
            JOIN product_form pf ON ps.product_form_id = pf.id
            JOIN packaging_treatment pt ON ps.packaging_treatment_id = pt.id
            JOIN users u ON sh.user_id = u.user_id
            WHERE 1 = 1
        `;
        const queryParams = [];

        if (userId) {
            query += ' AND sh.user_id = ?';
            queryParams.push(userId);
        }

        if (userName) {
            query += ' AND CONCAT(u.firstname, \' \', u.lastname) LIKE ?';
            queryParams.push(`%${userName}%`);
        }

        if (status) {
            query += ' AND sh.status = ?';
            queryParams.push(status);
        }

        if (productName) {
            query += ' AND ps.name LIKE ?';
            queryParams.push(`%${productName}%`);
        }

        if (category) {
            query += ' AND ps.product_category_id = ?';
            queryParams.push(category);
        }

        if (subCategory) {
            query += ' AND sc.id = ?';
            queryParams.push(subCategory);
        }

        if (fromDate && toDate) {
            query += ' AND sh.search_time BETWEEN ? AND ?';
            queryParams.push(fromDate, toDate);
        }

        query += ' ORDER BY sh.search_time DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit, 10), parseInt(offset, 10));

        const [enquiries] = await pool.query(query, queryParams);

        const countQuery = `
            SELECT COUNT(*) as totalCount 
            FROM search_history sh 
            WHERE 1 = 1
            ${userId ? ' AND sh.user_id = ?' : ''}
        `;

        const countParams = [];
        if (userId) {
            countParams.push(userId);
        }

        const [[{ totalCount }]] = await pool.query(countQuery, countParams);

        const totalPages = Math.ceil(totalCount / limit);

        if (!enquiries.length) {
            return res.json(new ApiResponse(200, { enquiries: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No enquiries found'));
        }

        res.json(new ApiResponse(200, {
            enquiries: enquiries,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
