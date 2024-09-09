import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import { handleError } from "../../../utils/ErrorHandler.js"
import bcrypt from 'bcrypt';

export const getAllStaffController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [countRows] = await pool.query('SELECT COUNT(*) as count FROM admin');
        const totalCount = countRows[0].count;
        const totalPages = Math.ceil(totalCount / limit);

        const [rows] = await pool.query(`
            SELECT 
                * from admin
            LIMIT ? OFFSET ?
        `, [Number(limit), Number(offset)]);

        const admins = rows.reduce((acc, row) => {
            const { id, name, emailid, status, address, phonenumber, country_code, page_id, page_name, can_create, can_read, can_update, can_delete, can_export, permission_id } = row;
            if (!acc[id]) {
                acc[id] = { id, name, emailid, status, address, phonenumber, country_code, permissions: [] };
            }
            acc[id].permissions.push({ page_id, page_name, can_create, can_read, can_update, can_delete, can_export, permission_id });
            return acc;
        }, {});

        res.json(new ApiResponse(200, {
            admins: Object.values(admins),
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }, 'Admins retrieved successfully'));
    } catch (error) {
        handleError(error, next);
    }
};

export const addStaffController = async (req, res, next) => {
    try {
        const { name, emailid, password, status, address, phonenumber, country_code } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO admin (name, emailid, password, status, address, phonenumber, country_code) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, emailid, hashedPassword, status, address, phonenumber, country_code]);
        const staffId = result.insertId;
        res.status(201).json(new ApiResponse(201, { staffId }, 'Staff created successfully'));
    } catch (error) {
        handleError(error, next);
    }
};

export const deleteStaffController = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        await pool.query('DELETE FROM admin WHERE id = ?', [staffId]);
        res.json(new ApiResponse(200, {}, 'Staff deleted successfully'));
    } catch (error) {
        handleError(error, next);
    }
};

export const updateStaffController = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        const updates = Object.entries(req.body)
            .filter(([key, value]) => value !== undefined)
            .map(([key, value]) => ({ key, value }));

        const connection = await pool.getConnection();
        await connection.beginTransaction();
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            updates.push({ key: 'password', value: hashedPassword });
        }

        try {
            const [existingStaff] = await connection.query('SELECT * FROM admin WHERE id = ?', [staffId]);
            if (!existingStaff.length) throw new CustomError(404, 'Staff not found');

            if (updates.length > 0) {
                const updateFields = updates.map(({ key }) => `${key} = ?`).join(', ');
                const updateValues = updates.map(({ value }) => value);
                updateValues.push(staffId);

                await connection.query(
                    `UPDATE admin SET ${updateFields} WHERE id = ?`,
                    updateValues
                );
            }
            await connection.commit();
            res.json(new ApiResponse(200, {}, 'Staff updated successfully'));
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