import pool from '../../config/database.js';
import ApiResponse from '../../utils/ApiResponse.js';
import CustomError from '../../utils/CustomError.js';

const ALL_PACKAGING_TYPE_ID = 4;

const buildSearchQuery = (params) => {
    let query = `
    SELECT 
        ps.*, 
        c.name AS category_name, c.image AS category_image,
        p.product_name, p.product_image, p.status AS product_status,
        pf.name AS product_form_name, pf.image AS product_form_image, pf.short_description AS product_form_description, pf.status AS product_form_status,
        pt.name AS packaging_treatment_name, pt.image AS packaging_treatment_image, pt.short_description AS packaging_treatment_description, pt.featured AS packaging_treatment_featured, pt.status AS packaging_treatment_status,
        pk.name AS packing_type_name, pk.short_description AS packing_type_description, pk.status AS packing_type_status,
        pm.material_name, pm.material_description, pm.wvtr, pm.otr, pm.cof, pm.sit, pm.gsm, pm.special_feature, pm.status AS packaging_material_status,
        pc.name AS packaging_machine_name, pc.image AS packaging_machine_image, pc.short_description AS packaging_machine_description, pc.status AS packaging_machine_status,
        mu.name AS min_order_quantity_unit_name, mu.symbol AS min_order_quantity_unit_symbol, mu.status AS min_order_quantity_unit_status,
        sc.name AS storage_condition_name, sc.short_description AS storage_condition_description, sc.status AS storage_condition_status,
        s.name AS subcategory_name, s.image AS subcategory_image, s.status AS subcategory_status
    FROM 
        packaging_solution ps
    JOIN 
        categories c ON ps.product_category_id = c.id
    JOIN 
        product p ON ps.product_id = p.id
    JOIN 
        subcategories s ON p.sub_category_id = s.id
    JOIN 
        product_form pf ON ps.product_form_id = pf.id
    JOIN 
        packaging_treatment pt ON ps.packaging_treatment_id = pt.id
    JOIN 
        packing_type pk ON ps.packing_type_id = pk.id
    JOIN 
        packaging_material pm ON ps.packaging_material_id = pm.id
    JOIN 
        packaging_machine pc ON ps.packaging_machine_id = pc.id
    LEFT JOIN 
        measurement_unit mu ON ps.min_order_quantity_unit_id = mu.id
    JOIN 
        storage_condition sc ON ps.storage_condition_id = sc.id
    WHERE 
        ps.status = 'active'
        AND c.status = 'active'
        AND p.status = 'active'
        AND s.status = 'active'
        AND pf.status = 'active'
        AND pt.status = 'active'
        AND pk.status = 'active'
        AND pm.status = 'active'
        AND pc.status = 'active'
        AND sc.status = 'active'
    `;

    const queryParams = [];

    if (params.category_id) {
        query += ' AND ps.product_category_id = ?';
        queryParams.push(params.category_id);
    }

    if (params.subcategory_id) {
        query += ' AND p.sub_category_id = ?';
        queryParams.push(params.subcategory_id);
    }

    if (params.product_id) {
        query += ' AND ps.product_id = ?';
        queryParams.push(params.product_id);
    }

    if (params.currentPackingTypeId && params.currentPackingTypeId !== ALL_PACKAGING_TYPE_ID) {
        query += ' AND ps.packing_type_id = ?';
        queryParams.push(params.currentPackingTypeId);
    }

    if (params.min_order_quantity_unit_id) {
        query += ' AND ps.min_order_quantity_unit_id = ?';
        queryParams.push(params.min_order_quantity_unit_id);
    }

    if (params.shelf_life_days) {
        query += ' AND ps.display_shelf_life_days >= ?';
        queryParams.push(params.shelf_life_days);
    }

    if (params.product_min_weight && params.product_max_weight) {
        query += ' AND ps.product_min_weight >= ? AND ps.product_max_weight <= ?';
        queryParams.push(params.product_min_weight, params.product_max_weight);
    }

    query += ' ORDER BY ps.id';

    return { query, queryParams };
};

const checkExistingSearch = async (connection, userId, params, packagingSolutionIds) => {
    const [existingSearchHistory] = await connection.query(`
        SELECT DISTINCT packing_type_id
        FROM search_history 
        WHERE user_id = ? 
        AND category_id ${params.category_id ? '= ?' : 'IS NULL'}
        AND subcategory_id ${params.subcategory_id ? '= ?' : 'IS NULL'}
        AND product_id ${params.product_id ? '= ?' : 'IS NULL'}
        AND shelf_life_days ${params.shelf_life_days ? '= ?' : 'IS NULL'}
        AND min_order_quantity_unit_id ${params.min_order_quantity_unit_id ? '= ?' : 'IS NULL'}
        AND product_min_weight ${params.product_min_weight ? '= ?' : 'IS NULL'}
        AND product_max_weight ${params.product_max_weight ? '= ?' : 'IS NULL'}
        AND packaging_solution_id IN (?)
    `, [
        userId,
        ...(params.category_id ? [params.category_id] : []),
        ...(params.subcategory_id ? [params.subcategory_id] : []),
        ...(params.product_id ? [params.product_id] : []),
        ...(params.shelf_life_days ? [params.shelf_life_days] : []),
        ...(params.min_order_quantity_unit_id ? [params.min_order_quantity_unit_id] : []),
        ...(params.product_min_weight ? [params.product_min_weight] : []),
        ...(params.product_max_weight ? [params.product_max_weight] : []),
        packagingSolutionIds
    ]);

    return existingSearchHistory.map(row => row.packing_type_id);
};

const deductCredit = async (connection, userId) => {
    const [creditRows] = await connection.query('SELECT credits FROM users WHERE user_id = ?', [userId]);
    if (!creditRows.length) throw new CustomError(404, 'User not found');

    const currentCredits = creditRows[0].credits;

    if (currentCredits < 1) {
        throw new CustomError(403, 'Insufficient credits to perform search');
    }

    const newCredits = currentCredits - 1;

    await connection.query('UPDATE users SET credits = ?, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?', [newCredits, userId]);

    await connection.query(
        'INSERT INTO credit_history (user_id, change_amount, description) VALUES (?, ?, ?)',
        [userId, -1, 'Credit deducted for packaging solution search']
    );
};

const insertSearchHistory = async (connection, userId, packagingSolutions, params, existingPackingTypeIds) => {
    for (const solution of packagingSolutions) {
        if (params.currentPackingTypeId === ALL_PACKAGING_TYPE_ID && existingPackingTypeIds.includes(solution.packing_type_id)) {
            continue;
        }

        await connection.query(`
            INSERT INTO search_history 
            (user_id, packaging_solution_id, search_time, category_id, subcategory_id, product_id, packing_type_id, shelf_life_days, min_order_quantity_unit_id, product_min_weight, product_max_weight)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            solution.id,
            params.category_id || null,
            params.subcategory_id || null,
            params.product_id || null,
            solution.packing_type_id,
            params.shelf_life_days || null,
            params.min_order_quantity_unit_id || null,
            params.product_min_weight || null,
            params.product_max_weight || null
        ]);
    }
};

export const searchPackagingSolutionsController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            category_id,
            subcategory_id,
            product_id,
            packing_type_id,
            shelf_life_days,
            product_min_weight,
            product_max_weight,
            min_order_quantity_unit_id
        } = req.body;

        const userId = req.user.userId;

        const currentPackingTypeId = packing_type_id || ALL_PACKAGING_TYPE_ID;

        const searchParams = {
            category_id,
            subcategory_id,
            product_id,
            currentPackingTypeId,
            shelf_life_days,
            product_min_weight,
            product_max_weight,
            min_order_quantity_unit_id
        };

        const { query, queryParams } = buildSearchQuery(searchParams);

        const [rows] = await connection.query(query, queryParams);

        if (!rows.length) {
            throw new CustomError(404, 'No packaging solutions found');
        }

        const packagingSolutionIds = rows.map(row => row.id);

        const existingPackingTypeIds = await checkExistingSearch(connection, userId, searchParams, packagingSolutionIds);

        let creditDeducted = false;

        if (currentPackingTypeId === ALL_PACKAGING_TYPE_ID) {
            const newPackingTypes = rows.filter(row => !existingPackingTypeIds.includes(row.packing_type_id));
            if (newPackingTypes.length > 0) {
                await insertSearchHistory(connection, userId, newPackingTypes, searchParams, existingPackingTypeIds);
                await deductCredit(connection, userId);
                creditDeducted = true;
            }
        } else if (!existingPackingTypeIds.includes(currentPackingTypeId)) {
            await deductCredit(connection, userId);
            await insertSearchHistory(connection, userId, rows, searchParams, []);
            creditDeducted = true;
        }

        await connection.commit();
        let message = "Packaging solutions fetched successfully,";
        if (creditDeducted) {
            message += " -1 Credit deducted";
        }

        res.json(new ApiResponse(200, rows, message));

    } catch (error) {
        await connection.rollback();
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};