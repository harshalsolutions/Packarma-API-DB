import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import bcrypt from 'bcryptjs';
import CustomError from '../../utils/CustomError.js';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { handleError } from "../../utils/ErrorHandler.js"

dotenv.config();

const generateToken = (adminId) => jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '1d' });

export const loginAdminController = async (req, res, next) => {
    try {
        const { emailid, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM admin WHERE emailid = ?', [emailid]);
        if (!rows.length) throw new CustomError(404, 'Admin not found');

        const admin = rows[0];
        if (!(await bcrypt.compare(password, admin.password))) throw new CustomError(401, 'Invalid credentials');

        const token = generateToken(admin.id);
        const { password: _, ...adminWithoutPassword } = admin;
        res.json(new ApiResponse(200, { admin: adminWithoutPassword, token }, 'Login successful'));
    } catch (error) {
        console.log('loginAdminController error:', error);
        handleError(error, next);
    }
};

export const updateAdminController = async (req, res, next) => {
    try {
        const { adminId } = req.params;
        const { name, emailid, phonenumber, country_code, address, status } = req.body;
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [existingAdmin] = await connection.query('SELECT * FROM admin WHERE id = ?', [adminId]);
            if (!existingAdmin.length) throw new CustomError(404, 'Admin not found');

            await connection.query(
                'UPDATE admin SET name = ?, emailid = ?, phonenumber = ?, country_code = ?, address = ?, status = ? WHERE id = ?',
                [name, emailid, phonenumber, country_code, address, status, adminId]
            );

            await connection.commit();
            res.json(new ApiResponse(200, null, 'Admin updated successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.log('updateAdminController error:', error);
        handleError(error, next);
    }
};

export const addAdminController = async (req, res, next) => {
    try {
        const { name, emailid, password, phonenumber, country_code, address, status = 'active' } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [existingAdmin] = await connection.query('SELECT * FROM admin WHERE emailid = ?', [emailid]);
            if (existingAdmin.length) throw new CustomError(400, 'Admin already exists');

            const [result] = await connection.query(
                'INSERT INTO admin (name, emailid, password, phonenumber, country_code, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, emailid, hashedPassword, phonenumber, country_code, address, status]
            );
            const adminId = result.insertId;

            await connection.commit();
            res.status(201).json(new ApiResponse(201, { adminId }, 'Admin created successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.log('addAdminController error:', error);
        handleError(error, next);
    }
};

export const deleteAdminController = async (req, res, next) => {
    try {
        const { adminId } = req.params;
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [result] = await connection.query('DELETE FROM admin WHERE id = ?', [adminId]);
            if (result.affectedRows === 0) throw new CustomError(404, 'Admin not found');

            await connection.commit();
            res.json(new ApiResponse(200, null, 'Admin deleted successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.log('deleteAdminController error:', error);
        handleError(error, next);
    }
};

export const getAdminController = async (req, res, next) => {
    try {
        const adminId = req.user.adminId;
        const [rows] = await pool.query(`
            SELECT 
                a.id, a.name, a.emailid, a.status, 
                p.page_id, p.can_create, p.can_read, p.can_update, p.can_delete, p.can_export,
                pg.page_name
            FROM admin a 
            LEFT JOIN permissions p ON a.id = p.admin_id 
            LEFT JOIN pages pg ON p.page_id = pg.id
            WHERE a.id = ?`, [adminId]);
        if (!rows.length) throw new CustomError(404, 'Admin not found');

        const admin = {
            id: rows[0].id,
            name: rows[0].name,
            emailid: rows[0].emailid,
            status: rows[0].status,
            permissions: rows.map(row => ({
                page_id: row.page_id,
                page_name: row.page_name,
                can_create: row.can_create,
                can_read: row.can_read,
                can_update: row.can_update,
                can_delete: row.can_delete,
                can_export: row.can_export
            }))
        };

        res.json(new ApiResponse(200, admin, 'Admin data retrieved successfully'));
    } catch (error) {
        console.log('getAdminController error:', error);
        handleError(error, next);
    }
};
