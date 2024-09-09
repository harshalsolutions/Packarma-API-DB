import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';
import { handleError } from "../../../utils/ErrorHandler.js"

export const addPermissionController = async (req, res, next) => {
    try {
        const { admin_id, page_id, can_create, can_read, can_update, can_delete, can_export } = req.body;
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [existingPermission] = await connection.query('SELECT * FROM permissions WHERE admin_id = ? AND page_id = ?', [admin_id, page_id]);
            if (existingPermission.length) throw new CustomError(400, 'Permission already exists');

            const [result] = await connection.query(
                'INSERT INTO permissions (admin_id, page_id, can_create, can_read, can_update, can_delete, can_export) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [admin_id, page_id, can_create, can_read, can_update, can_delete, can_export]
            );
            const permissionId = result.insertId;

            await connection.commit();
            res.status(201).json(new ApiResponse(201, { permissionId }, 'Permission created successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};

export const updatePermissionController = async (req, res, next) => {
    try {
        const { permissionId } = req.params;
        const updates = Object.entries(req.body)
            .filter(([key, value]) => value !== undefined)
            .map(([key, value]) => ({ key, value }));

        const connection = await pool.getConnection();
        await connection.beginTransaction();
        console.log(req.body)
        try {
            const [existingPermission] = await connection.query('SELECT * FROM permissions WHERE id = ?', [permissionId]);
            if (!existingPermission.length) throw new CustomError(404, 'Permission not found');

            if (updates.length > 0) {
                const updateFields = updates.map(({ key }) => `${key} = ?`).join(', ');
                const updateValues = updates.map(({ value }) => value);
                updateValues.push(permissionId);

                await connection.query(
                    `UPDATE permissions SET ${updateFields} WHERE id = ?`,
                    updateValues
                );
            }

            await connection.commit();
            res.json(new ApiResponse(200, null, 'Permission updated successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};

export const deletePermissionController = async (req, res, next) => {
    try {
        const { permissionId } = req.params;
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [result] = await connection.query('DELETE FROM permissions WHERE id = ?', [permissionId]);
            if (result.affectedRows === 0) throw new CustomError(404, 'Permission not found');

            await connection.commit();
            res.json(new ApiResponse(200, null, 'Permission deleted successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};

export const getPermissionByAdminIdController = async (req, res, next) => {
    try {
        const { adminId } = req.params;
        const [rows] = await pool.query('SELECT p.*, pa.page_name FROM permissions p LEFT JOIN pages pa ON p.page_id = pa.id WHERE p.admin_id = ?', [adminId]);
        if (!rows.length) throw new CustomError(404, 'Permission not found');

        res.json(new ApiResponse(200, rows, 'Permission data retrieved successfully'));
    } catch (error) {
        handleError(error, next);
    }
};

export const getAllPermissionsController = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const [rows] = await pool.query('SELECT p.*, pa.page_name FROM permissions p LEFT JOIN pages pa ON p.page_id = pa.id');
        const totalCount = rows.length;
        const totalPages = Math.ceil(totalCount / limit);
        res.json(new ApiResponse(200, {
            permissions: rows,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        handleError(error, next);
    }
};
