import ApiResponse from '../utils/ApiResponse.js';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import otpGenerator from '../utils/otpGenerator.js';
import sendOtpEmail from "../utils/emailSender.js";
import CustomError from '../utils/CustomError.js';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"
dotenv.config();

export const registerController = async (req, res, next) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)';
        await pool.query(query, [firstname, lastname, email, hashedPassword]);
        res.status(201).json(new ApiResponse(201, null, 'User registered successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return next(new CustomError(409, 'Email already in use'));
        }
        next(new CustomError(500, error.message));
    }
};

export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            throw new CustomError(404, 'User not found');
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new CustomError(401, 'Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json(new ApiResponse(200, { user: userWithoutPassword, token }, 'Login successful'));
    } catch (error) {
        next(error);
    }
};

export const updateUserController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(userId);
        const query = `UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?`;
        await pool.query(query, values);
        res.json(new ApiResponse(200, null, 'User updated successfully'));
    } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return next(new CustomError(400, 'Invalid field in update query'));
        }
        next(new CustomError(500, error.message));
    }
};

export const getUserController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        if (rows.length === 0) {
            throw new CustomError(404, 'User not found');
        }
        const user = rows[0];
        const { password: _, ...userWithoutPassword } = user;
        res.json(new ApiResponse(200, userWithoutPassword));
    } catch (error) {
        next(error);
    }
};

export const requestOtpController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const [rows] = await pool.query('SELECT email FROM users WHERE user_id = ?', [userId]);
        if (rows.length === 0) {
            throw new CustomError(404, 'User not found');
        }
        const user = rows[0];
        const otp = otpGenerator();
        const query = 'UPDATE users SET otp = ?, otpCreatedAt = CURRENT_TIMESTAMP WHERE user_id = ?';
        await pool.query(query, [otp, userId]);
        await sendOtpEmail(user.email, otp);
        res.json(new ApiResponse(200, null, 'OTP sent successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const verifyOtpController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { otp } = req.body;

        const [rows] = await pool.query('SELECT otp, otpCreatedAt FROM users WHERE user_id = ?', [userId]);
        if (rows.length === 0) {
            throw new CustomError(404, 'User not found');
        }
        const { otp: savedOtp, otpCreatedAt } = rows[0];

        if (savedOtp !== otp || (Date.now() - new Date(otpCreatedAt).getTime()) > 10 * 60 * 1000) {
            throw new CustomError(400, 'Invalid or expired OTP');
        }

        const query = `UPDATE users 
                       SET email_verified = 1, 
                           email_verified_at = CURRENT_TIMESTAMP, 
                           otp = NULL, 
                           otpCreatedAt = NULL 
                       WHERE user_id = ?`;
        await pool.query(query, [userId]);

        res.json(new ApiResponse(200, null, 'Email Verified!'));
    } catch (error) {
        next(error);
    }
};

export const requestPasswordResetOtpController = async (req, res, next) => {
    try {
        const { email } = req.body;

        const [rows] = await pool.query('SELECT user_id, email FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            throw new CustomError(404, 'User not found');
        }
        const user = rows[0];
        const otp = otpGenerator();

        const query = 'UPDATE users SET otp = ?, otpCreatedAt = CURRENT_TIMESTAMP WHERE user_id = ?';
        await pool.query(query, [otp, user.user_id]);

        await sendOtpEmail(user.email, otp);
        res.json(new ApiResponse(200, null, 'OTP sent successfully for password reset'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const resetPasswordController = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        const [rows] = await pool.query('SELECT otp, otpCreatedAt FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            throw new CustomError(404, 'User not found');
        }
        const { otp: savedOtp, otpCreatedAt } = rows[0];

        if (savedOtp !== otp || (Date.now() - new Date(otpCreatedAt).getTime()) > 10 * 60 * 1000) {
            throw new CustomError(400, 'Invalid or expired OTP');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const query = `UPDATE users 
                       SET password = ?, 
                           otp = NULL, 
                           otpCreatedAt = NULL, 
                           updatedAt = CURRENT_TIMESTAMP 
                       WHERE email = ?`;
        await pool.query(query, [hashedPassword, email]);

        res.json(new ApiResponse(200, null, 'Password updated successfully'));
    } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return next(new CustomError(400, 'Invalid field in update query'));
        }
        next(new CustomError(500, error.message));
    }
};