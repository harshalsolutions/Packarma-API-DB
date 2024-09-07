import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import { handleError } from "../../../utils/ErrorHandler.js"


export const getAllStaffController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [countRows] = await pool.query('SELECT COUNT(*) as count FROM admin');
        const totalCount = countRows[0].count;
        const totalPages = Math.ceil(totalCount / limit);

        const [rows] = await pool.query(`
            SELECT 
                a.id, a.name, a.emailid, a.status, 
                p.page_id, p.can_create, p.can_read, p.can_update, p.can_delete, p.can_export, p.id as permission_id,
                pg.page_name
            FROM admin a 
            LEFT JOIN permissions p ON a.id = p.admin_id 
            LEFT JOIN pages pg ON p.page_id = pg.id
            LIMIT ? OFFSET ?
        `, [Number(limit), Number(offset)]);

        const admins = rows.reduce((acc, row) => {
            const { id, name, emailid, status, page_id, page_name, can_create, can_read, can_update, can_delete, can_export, permission_id } = row;
            if (!acc[id]) {
                acc[id] = { id, name, emailid, status, permissions: [] };
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
        console.log('getAllAdminsController error:', error);
        handleError(error, next);
    }
};

export const addStaffController = async (req, res, next) => {
    try {
        const { name, emailid, password, status } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO admin (name, emailid, password, status) VALUES (?, ?, ?, ?)', [name, emailid, hashedPassword, status]);
        const staffId = result.insertId;
        res.status(201).json(new ApiResponse(201, { staffId }, 'Staff created successfully'));
    } catch (error) {
        console.log('addStaffController error:', error);
        handleError(error, next);
    }
};

export const deleteStaffController = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        await pool.query('DELETE FROM admin WHERE id = ?', [staffId]);
        res.json(new ApiResponse(200, {}, 'Staff deleted successfully'));
    } catch (error) {
        console.log('deleteStaffController error:', error);
        handleError(error, next);
    }
};

export const updateStaffController = async (req, res, next) => {
    try {
        const { staffId } = req.params;
        const { name, emailid, status } = req.body;
        await pool.query('UPDATE admin SET name = ?, emailid = ?, status = ? WHERE id = ?', [name, emailid, status, staffId]);
        res.json(new ApiResponse(200, {}, 'Staff updated successfully'));
    } catch (error) {
        console.log('updateStaffController error:', error);
        handleError(error, next);
    }
};