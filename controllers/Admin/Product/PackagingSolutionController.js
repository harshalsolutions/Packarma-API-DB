import ApiResponse from "../../../utils/ApiResponse.js"
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import ExcelJS from 'exceljs';

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
        const {
            name,
            structure_type,
            storage_condition_id,
            product_name,
            product_form_name,
            packaging_treatment_name,
            packing_type_name,
            packaging_machine_name,
            packaging_material_name,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;

        let query = `SELECT 
        ps.*, 
        sc.name AS storage_condition_name,
        p.product_name,
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
        const conditions = [];

        if (name) {
            conditions.push('ps.name LIKE ?');
            queryParams.push(`%${name}%`);
        }

        if (structure_type) {
            conditions.push('ps.structure_type LIKE ?');
            queryParams.push(`%${structure_type}%`);
        }

        if (storage_condition_id) {
            conditions.push('ps.storage_condition_id = ?');
            queryParams.push(storage_condition_id);
        }

        if (product_name) {
            conditions.push('p.product_name LIKE ?');
            queryParams.push(`%${product_name}%`);
        }

        if (product_form_name) {
            conditions.push('pf.name LIKE ?');
            queryParams.push(`%${product_form_name}%`);
        }

        if (packaging_treatment_name) {
            conditions.push('pt.name LIKE ?');
            queryParams.push(`%${packaging_treatment_name}%`);
        }

        if (packing_type_name) {
            conditions.push('pk.name LIKE ?');
            queryParams.push(`%${packing_type_name}%`);
        }

        if (packaging_machine_name) {
            conditions.push('pm.name LIKE ?');
            queryParams.push(`%${packaging_machine_name}%`);
        }

        if (packaging_material_name) {
            conditions.push('pmat.material_name LIKE ?');
            queryParams.push(`%${packaging_material_name}%`);
        }

        if (status) {
            conditions.push('ps.status = ?');
            queryParams.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY ps.createdAt DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [rows] = await pool.query(query, queryParams);

        let countQuery = `SELECT COUNT(*) as count FROM packaging_solution ps
            LEFT JOIN product p ON ps.product_id = p.id
            LEFT JOIN product_form pf ON ps.product_form_id = pf.id
            LEFT JOIN packaging_treatment pt ON ps.packaging_treatment_id = pt.id
            LEFT JOIN packing_type pk ON ps.packing_type_id = pk.id
            LEFT JOIN packaging_machine pm ON ps.packaging_machine_id = pm.id
            LEFT JOIN packaging_material pmat ON ps.packaging_material_id = pmat.id`;

        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [totalCount] = await pool.query(countQuery, queryParams.slice(0, -2));
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
            name.toUpperCase().trim(), structure_type, sequence, storage_condition_id,
            display_shelf_life_days, product_id, product_category_id,
            product_form_id, packaging_treatment_id, packing_type_id,
            packaging_machine_id, packaging_material_id, product_min_weight,
            product_max_weight, min_order_quantity, min_order_quantity_unit_id,
            image
        ]);

        res.status(201).json(new ApiResponse(201, null, 'Packaging Solution created successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));

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
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
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

export const exportAllPackagingSolutionController = async (req, res, next) => {
    try {
        const { link } = req.body;
        const [packagingSolutionRows] = await pool.query(`
            SELECT 
                ps.*,
                sc.name AS storage_condition_name,
                p.product_name,
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
                measurement_unit mu ON ps.min_order_quantity_unit_id = mu.id
        `);

        if (!packagingSolutionRows.length) throw new CustomError(404, 'No packaging solutions found');

        const csvData = packagingSolutionRows.map(solution => ({
            id: solution.id,
            name: solution.name,
            structure_type: solution.structure_type,
            sequence: solution.sequence,
            storage_condition_name: solution.storage_condition_name,
            display_shelf_life_days: solution.display_shelf_life_days,
            product_name: solution.product_name,
            category_name: solution.category_name,
            product_form_name: solution.product_form_name,
            packaging_treatment_name: solution.packaging_treatment_name,
            packing_type_name: solution.packing_type_name,
            packaging_machine_name: solution.packaging_machine_name,
            packaging_material_name: solution.packaging_material_name,
            product_min_weight: solution.product_min_weight,
            product_max_weight: solution.product_max_weight,
            min_order_quantity: solution.min_order_quantity,
            min_order_quantity_unit_name: solution.min_order_quantity_unit_name,
            status: solution.status,
            createdAt: solution.createdAt,
            updatedAt: solution.updatedAt,
            image: (link ? link : "") + solution.image
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('All Packaging Solutions');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Image', key: 'image', width: 30 },
            { header: 'Structure Type', key: 'structure_type', width: 20 },
            { header: 'Sequence', key: 'sequence', width: 10 },
            { header: 'Storage Condition', key: 'storage_condition_name', width: 20 },
            { header: 'Display Shelf Life (Days)', key: 'display_shelf_life_days', width: 20 },
            { header: 'Product Name', key: 'product_name', width: 30 },
            { header: 'Category Name', key: 'category_name', width: 20 },
            { header: 'Product Form', key: 'product_form_name', width: 20 },
            { header: 'Packaging Treatment', key: 'packaging_treatment_name', width: 20 },
            { header: 'Packing Type', key: 'packing_type_name', width: 20 },
            { header: 'Packaging Machine', key: 'packaging_machine_name', width: 20 },
            { header: 'Packaging Material', key: 'packaging_material_name', width: 20 },
            { header: 'Min Weight', key: 'product_min_weight', width: 15 },
            { header: 'Max Weight', key: 'product_max_weight', width: 15 },
            { header: 'Min Order Quantity', key: 'min_order_quantity', width: 20 },
            { header: 'Min Order Quantity Unit', key: 'min_order_quantity_unit_name', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Created At', key: 'createdAt', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
            { header: 'Updated At', key: 'updatedAt', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
        ];

        worksheet.addRows(csvData);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`packaging_solutions_${new Date().toISOString()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        next(error);
    }
};