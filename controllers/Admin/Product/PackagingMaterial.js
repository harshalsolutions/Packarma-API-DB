import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';
import ExcelJS from 'exceljs';

export const createPackagingMaterialController = async (req, res, next) => {
    try {
        const { material_name, material_description, wvtr, otr, cof, sit, gsm, special_feature } = req.body;
        const query = 'INSERT INTO packaging_material (material_name, material_description, wvtr, otr, cof, sit, gsm, special_feature) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [material_name, material_description, wvtr, otr, cof, sit, gsm, special_feature ?? null]);
        res.status(201).json(new ApiResponse(201, null, 'Packaging Material created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
export const getPackagingMaterialController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM packaging_material WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {}, 'No Packaging Material found'));

        res.json(new ApiResponse(200, rows[0], 'Packaging Material retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updatePackagingMaterialController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const [existingPackagingMaterialRows] = await pool.query('SELECT * FROM packaging_material WHERE id = ?', [id]);
        if (!existingPackagingMaterialRows.length) throw new CustomError(404, 'Packaging Material not found');

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE packaging_material SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Packaging Material updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deletePackagingMaterialController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingPackagingMaterialRows] = await pool.query('SELECT * FROM packaging_material WHERE id = ?', [id]);
        if (!existingPackagingMaterialRows.length) throw new CustomError(404, 'Packaging Material not found');

        await pool.query('DELETE FROM packaging_material WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Packaging Material deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllPackagingMaterialsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM packaging_material';
        const queryParams = [];

        if (search) {
            query += ' WHERE material_name LIKE ?';
            queryParams.push(`%${search}%`);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), offset);

        const [rows] = await pool.query(query, queryParams);
        const [totalCount] = await pool.query(`SELECT COUNT(*) as count FROM packaging_material${search ? ' WHERE material_name LIKE ?' : ''}`, search ? `%${search}%` : []);

        const total = totalCount[0].count;
        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: Number(page),
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: Number(limit)
        };

        res.json(new ApiResponse(200, { packagingMaterials: rows, pagination }, "Packaging Materials retrieved successfully"));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const exportAllMaterialsController = async (req, res, next) => {
    try {
        const [materialRows] = await pool.query(`
            SELECT 
                p.id,
                p.material_name AS packaging_material_name,
                p.material_description AS packaging_material_description,
                p.wvtr,
                p.otr,
                p.cof,
                p.sit,
                p.gsm,
                p.status,
                p.createdAt,
                p.updatedAt
            FROM 
                packaging_material p
        `);

        if (!materialRows.length) throw new CustomError(404, 'No materials found');

        const csvData = materialRows.map(material => ({
            id: material.id,
            packaging_material_name: material.packaging_material_name,
            packaging_material_description: material.packaging_material_description,
            wvtr: material.wvtr,
            otr: material.otr,
            cof: material.cof,
            sit: material.sit,
            gsm: material.gsm,
            status: material.status,
            updatedAt: material.updatedAt,
            createdAt: material.createdAt,
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Packaging Materials');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Packaging Material Name', key: 'packaging_material_name', width: 30 },
            { header: 'Packaging Material Description', key: 'packaging_material_description', width: 50 },
            { header: 'WVTR', key: 'wvtr', width: 15 },
            { header: 'OTR', key: 'otr', width: 15 },
            { header: 'COF', key: 'cof', width: 15 },
            { header: 'SIT', key: 'sit', width: 15 },
            { header: 'GSM', key: 'gsm', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            {
                header: 'Created At', key: 'createdAt', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' }
            },
            {
                header: 'Updated At', key: 'updatedAt', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' }
            },
        ];

        worksheet.addRows(csvData);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`packaging_materials_${Date.now()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};
