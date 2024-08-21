import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import bcrypt from 'bcryptjs';
import otpGenerator from '../../utils/otpGenerator.js';
import sendOtpEmail from "../../utils/emailSender.js";
import CustomError from '../../utils/CustomError.js';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { generateReferralCode } from '../../utils/generateReferalCode.js';

dotenv.config();

const handleError = (error, next) => {
    if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Email already in use'));
    if (error.code === 'ER_BAD_FIELD_ERROR') return next(new CustomError(400, 'Invalid field in update query'));
    else next(new CustomError(500, error.message));
};

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const registerController = async (req, res, next) => {
    try {
        const { firstname, lastname, email, password, referralCode } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.query(
                'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
                [firstname, lastname, email, hashedPassword]
            );
            const userId = userResult.insertId;
            const newReferralCode = generateReferralCode(10);
            if (referralCode) {
                const [referralCodeResult] = await connection.query(
                    'SELECT id FROM referral_codes WHERE code = ?',
                    [referralCode]
                );

                if (referralCodeResult.length > 0) {
                    const referralCodeId = referralCodeResult[0].id;
                    await connection.query(
                        'INSERT INTO referrals (referral_code_id, referred_user_id, account_created) VALUES (?, ?, ?)',
                        [referralCodeId, userId, true]
                    );
                } else {
                    throw new CustomError(400, 'Invalid referral code');
                }
            }
            const [newReferralCodeResult] = await connection.query(
                'INSERT INTO referral_codes (user_id, code) VALUES (?, ?)',
                [userId, newReferralCode]
            );
            const newReferralCodeId = newReferralCodeResult.insertId;
            await connection.query(
                'UPDATE users SET referral_code_id = ? WHERE user_id = ?',
                [newReferralCodeId, userId]
            );
            await connection.commit();
            res.status(201).json(new ApiResponse(201, { referralCode: newReferralCode }, 'User registered successfully'));
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


export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!rows.length) throw new CustomError(404, 'User not found');

        const user = rows[0];
        if (!(await bcrypt.compare(password, user.password))) throw new CustomError(401, 'Invalid credentials');

        const token = generateToken(user.user_id);
        const { password: _, ...userWithoutPassword } = user;
        res.json(new ApiResponse(200, { user: userWithoutPassword, token }, 'Login successful'));
    } catch (error) {
        next(error);
    }
};

export const updateUserController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const updateData = req.body;
        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), userId];

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const query = `UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?`;
            await connection.query(query, values);

            await connection.commit();
            res.json(new ApiResponse(200, null, 'User updated successfully'));
        } catch (error) {
            await connection.rollback();
            handleError(error, next);
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};


export const getUserController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        if (!rows.length) throw new CustomError(404, 'User not found');

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
        if (!rows.length) throw new CustomError(404, 'User not found');

        const user = rows[0];
        const otp = otpGenerator();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await pool.query('INSERT INTO otp (user_id, otp_type, otp, expiresAt) VALUES (?, ?, ?, ?)',
            [userId, 'verify_email', otp, expiresAt]);
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

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [rows] = await connection.query(
                'SELECT otp, expiresAt FROM otp WHERE user_id = ? AND otp_type = "verify_email"',
                [userId]
            );
            if (!rows.length) throw new CustomError(404, 'OTP not found');
            const { otp: savedOtp, expiresAt } = rows[0];
            if (savedOtp !== otp || Date.now() > new Date(expiresAt).getTime()) {
                throw new CustomError(400, 'Invalid or expired OTP');
            }
            await connection.query(
                'UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [userId]
            );
            await connection.query(
                'DELETE FROM otp WHERE user_id = ? AND otp_type = "verify_email"',
                [userId]
            );
            await connection.commit();
            res.json(new ApiResponse(200, null, 'Email Verified!'));
        } catch (error) {
            await connection.rollback();
            handleError(error, next);
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};


export const requestPasswordResetOtpController = async (req, res, next) => {
    try {
        const { email } = req.body;
        const [rows] = await pool.query('SELECT user_id, email FROM users WHERE email = ?', [email]);
        if (!rows.length) throw new CustomError(404, 'User not found');

        const user = rows[0];
        const otp = otpGenerator();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await pool.query('INSERT INTO otp (user_id, otp_type, otp, expiresAt) VALUES (?, ?, ?, ?)',
            [user.user_id, 'reset_password', otp, expiresAt]);
        await sendOtpEmail(user.email, otp);
        res.json(new ApiResponse(200, null, 'OTP sent successfully for password reset'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const resetPasswordController = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [rows] = await connection.query(
                'SELECT otp, expiresAt FROM otp WHERE user_id = (SELECT user_id FROM users WHERE email = ?) AND otp_type = "reset_password"',
                [email]
            );

            if (!rows.length) throw new CustomError(404, 'User not found or OTP expired');

            const { otp: savedOtp, expiresAt } = rows[0];
            if (savedOtp !== otp || Date.now() > new Date(expiresAt).getTime()) {
                throw new CustomError(400, 'Invalid or expired OTP');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await connection.query(
                'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?',
                [hashedPassword, email]
            );

            await connection.query(
                'DELETE FROM otp WHERE user_id = (SELECT user_id FROM users WHERE email = ?) AND otp_type = "reset_password"',
                [email]
            );

            await connection.commit();
            res.json(new ApiResponse(200, null, 'Password updated successfully'));
        } catch (error) {
            await connection.rollback();
            handleError(error, next);
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};
