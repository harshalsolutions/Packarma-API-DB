import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';

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
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query('SELECT * FROM packaging_material ORDER BY createdAt DESC LIMIT ? OFFSET ?', [parseInt(limit), offset]);
        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM packaging_material');

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