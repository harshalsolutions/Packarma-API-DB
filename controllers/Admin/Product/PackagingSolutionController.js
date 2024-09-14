import ApiResponse from "../../../utils/ApiResponse.js"
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';


export const getPackagingSolutionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM packaging_solution WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {
            packagingSolution: []
        }, 'No Packaging Solution found'));
        res.json(new ApiResponse(200, rows[0], 'Packaging Solution retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllPackagingSolutionsController = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `SELECT 
        ps.*, 
        sc.name AS storage_condition_name,
        product_name AS product_name,
        c.name AS category_name,
        pf.name AS product_form_name,
        pt.name AS packaging_treatment_name,
        pk.name AS packing_type_name,
        pm.name AS packaging_machine_name,
        pmat.material_name AS packaging_material_name,
        mu.name AS min_order_quantity_unit_name
        FROM 
            packaging_solution ps
        LEFT JOIN 
            storage_condition sc ON ps.storage_condition_id = sc.id
        LEFT JOIN 
            product p ON ps.product_id = p.id
        LEFT JOIN 
            categories c ON ps.product_category_id = c.id
        LEFT JOIN 
            product_form pf ON ps.product_form_id = pf.id
        LEFT JOIN 
            packaging_treatment pt ON ps.packaging_treatment_id = pt.id
        LEFT JOIN 
            packing_type pk ON ps.packing_type_id = pk.id   
        LEFT JOIN 
            packaging_machine pm ON ps.packaging_machine_id = pm.id
        LEFT JOIN 
            packaging_material pmat ON ps.packaging_material_id = pmat.id
        LEFT JOIN 
            measurement_unit mu ON ps.min_order_quantity_unit_id = mu.id`;
        const queryParams = [];

        if (status) {
            query += ' WHERE ps.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY ps.createdAt DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [rows] = await pool.query(query, queryParams);
        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM packaging_solution' + (status ? ' WHERE status = ?' : ''), status ? [status] : []);

        const total = totalCount[0].count;
        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: Number(page),
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: Number(limit)
        };

        res.json(new ApiResponse(200, {
            packagingSolutions: rows,
            pagination
        }, "Packaging Solutions retrieved successfully"));

    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const createPackagingSolutionController = async (req, res, next) => {
    try {
        const {
            name,
            structure_type,
            sequence,
            storage_condition_id,
            display_shelf_life_days,
            product_id,
            product_category_id,
            product_form_id,
            packaging_treatment_id,
            packing_type_id,
            packaging_machine_id,
            packaging_material_id,
            product_min_weight,
            product_max_weight,
            min_order_quantity,
            min_order_quantity_unit_id
        } = req.body;

        let image = null;

        if (req.file) {
            image = `/media/packagingsolution/${req.file.filename}`;
        }

        const query = `
            INSERT INTO packaging_solution (
                name, structure_type, sequence, storage_condition_id, 
                display_shelf_life_days, product_id, product_category_id, 
                product_form_id, packaging_treatment_id, packing_type_id, 
                packaging_machine_id, packaging_material_id, product_min_weight, 
                product_max_weight, min_order_quantity, min_order_quantity_unit_id, 
                image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(query, [
            name, structure_type, sequence, storage_condition_id,
            display_shelf_life_days, product_id, product_category_id,
            product_form_id, packaging_treatment_id, packing_type_id,
            packaging_machine_id, packaging_material_id, product_min_weight,
            product_max_weight, min_order_quantity, min_order_quantity_unit_id,
            image
        ]);

        res.status(201).json(new ApiResponse(201, null, 'Packaging Solution created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updatePackagingSolutionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.type;

        console.log(updateData)

        if (req.file) {
            const [existingPackagingSolutionRows] = await pool.query('SELECT image FROM packaging_solution WHERE id = ?', [id]);
            if (!existingPackagingSolutionRows.length) throw new CustomError(404, 'Packaging Solution not found');

            const oldFilePath = existingPackagingSolutionRows[0].image;
            if (oldFilePath) {
                const absolutePath = path.join(process.cwd(), oldFilePath);
                unlink(absolutePath, (err) => {
                    if (err) console.error(`Error deleting file: ${err.message}`);
                });
            }

            updateData.image = `/media/packagingsolution/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE packaging_solution SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Packaging Solution updated successfully'));
    } catch (error) {
        console.log(error);
        next(new CustomError(500, error.message));
    }
};

export const deletePackagingSolutionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingPackagingSolutionRows] = await pool.query('SELECT image FROM packaging_solution WHERE id = ?', [id]);
        if (!existingPackagingSolutionRows.length) throw new CustomError(404, 'Packaging Solution not found');

        const oldFilePath = existingPackagingSolutionRows[0].image;
        if (oldFilePath) {
            const absolutePath = path.join(process.cwd(), oldFilePath);
            unlink(absolutePath, (err) => {
                if (err) console.error(`Error deleting file: ${err.message}`);
            });
        }

        await pool.query('DELETE FROM packaging_solution WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Packaging Solution deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
