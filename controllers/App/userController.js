import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import bcrypt from 'bcryptjs';
import generateOTP from "../../utils/otpGenerator.js";
import sendOtpEmail from "../../utils/emailSender.js";
import CustomError from '../../utils/CustomError.js';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { generateReferralCode } from '../../utils/generateReferalCode.js';
import { handleError } from "../../utils/ErrorHandler.js"

dotenv.config();


const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const registerController = async (req, res, next) => {
    try {
        const { firstname, lastname, email, password, referralCode, type = "normal" } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.query(
                'INSERT INTO users (firstname, lastname, email, password, type) VALUES (?, ?, ?, ?, ?)',
                [firstname, lastname, email, hashedPassword, type]
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

export const authenticateFirebaseController = async (req, res, next) => {
    try {
        const { email, type, uid, firstname, lastname, referralCode } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length) {
            const user = rows[0];
            if (user.type === 'normal') {
                throw new CustomError(400, 'User already registered with normal login');
            } else {
                const token = generateToken(user.user_id);
                const { password: _, ...userWithoutPassword } = user;
                return res.json(new ApiResponse(200, { user: userWithoutPassword, token }, 'Login successful'));
            }
        } else {
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                const [userResult] = await connection.query(
                    'INSERT INTO users (firstname, lastname, email, type, uid) VALUES (?, ?, ?, ?, ?)',
                    [firstname, lastname, email, type, uid]
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

                const token = generateToken(userId);
                await connection.commit();
                res.status(201).json(new ApiResponse(201, { token, referralCode: newReferralCode }, 'User registered successfully'));
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }
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
        const [rows] = await pool.query(
            `SELECT u.*, r.code as referral_code, 
                CASE 
                    WHEN us.end_date < CURRENT_DATE THEN NULL 
                    ELSE us.subscription_id 
                END AS subscription_id,
                CASE 
                    WHEN us.end_date < CURRENT_DATE THEN NULL 
                    ELSE us.start_date 
                END AS start_date,
                CASE 
                    WHEN us.end_date < CURRENT_DATE THEN NULL 
                    ELSE us.end_date 
                END AS end_date,
                CASE 
                    WHEN us.end_date < CURRENT_DATE THEN NULL 
                    ELSE s.type 
                END AS subscription_name 
                FROM users u 
                LEFT JOIN referral_codes r ON u.user_id = r.user_id 
                LEFT JOIN user_subscriptions us ON u.user_id = us.user_id 
                LEFT JOIN subscriptions s ON us.subscription_id = s.id 
                WHERE u.user_id = ? AND (us.createdAt IS NULL OR us.createdAt = (
                    SELECT MAX(createdAt) 
                    FROM user_subscriptions 
                    WHERE user_id = u.user_id
                ))`,
            [userId]
        );
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
        const { email } = req.body;
        const [userRows] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);

        if (userRows.length === 0) {
            throw new CustomError(404, 'User not found');
        }

        const userId = userRows[0].user_id;
        const otpType = 'verify_email';

        await pool.query('DELETE FROM otp WHERE user_id = ? AND otp_type = ?', [userId, otpType]);

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            'INSERT INTO otp (user_id, otp_type, otp, expiresAt) VALUES (?, ?, ?, ?)',
            [userId, otpType, otp, expiresAt]
        );

        await sendOtpEmail(email, otp);

        res.json(new ApiResponse(200, null, 'OTP sent successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const verifyOtpController = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [rows] = await connection.query(
                'SELECT otp, expiresAt FROM otp WHERE user_id = (SELECT user_id FROM users WHERE email = ?) AND otp_type = "verify_email"',
                [email]
            );

            if (!rows.length) throw new CustomError(404, 'OTP not found');

            const { otp: savedOtp, expiresAt } = rows[0];
            if (savedOtp !== otp || Date.now() > new Date(expiresAt).getTime()) {
                throw new CustomError(400, 'Invalid or expired OTP');
            }

            await connection.query(
                'UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP WHERE email = ?',
                [email]
            );

            await connection.query(
                'DELETE FROM otp WHERE user_id = (SELECT user_id FROM users WHERE email = ?) AND otp_type = "verify_email"',
                [email]
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
        const otpType = 'reset_password';

        await pool.query('DELETE FROM otp WHERE user_id = ? AND otp_type = ?', [user.user_id, otpType]);

        const otp = otpGenerator();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            'INSERT INTO otp (user_id, otp_type, otp, expiresAt) VALUES (?, ?, ?, ?)',
            [user.user_id, otpType, otp, expiresAt]
        );

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


export const updatePasswordController = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [rows] = await connection.query(
                'SELECT password FROM users WHERE user_id = ?',
                [userId]
            );

            if (!rows.length) throw new CustomError(404, 'User not found');

            const { password: hashedPassword } = rows[0];

            const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
            if (!isPasswordValid) {
                throw new CustomError(400, 'Current password is incorrect');
            }

            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            await connection.query(
                'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?',
                [newHashedPassword, userId]
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


export const freeCreditDocumentController = async (req, res, next) => {
    const connection = await pool.getConnection();
    const userId = req.user.userId;

    try {
        const { email_domain, gst_number } = req.body;
        let gst_document_link = null;
        if (req.file) {
            gst_document_link = `/media/${req.body.type}/${req.file.filename}`;
        }

        await connection.beginTransaction();

        const updateData = [];
        let query = 'UPDATE users SET ';

        if (email_domain) {
            query += 'email_domain = ?, ';
            updateData.push(email_domain);
        }
        if (gst_number) {
            query += 'gst_number = ?, ';
            updateData.push(gst_number);
        }
        if (gst_document_link) {
            query += 'gst_document_link = ?, ';
            updateData.push(gst_document_link);
        }

        query = query.slice(0, -2);
        query += ' WHERE user_id = ?';
        updateData.push(userId);

        await connection.query(query, updateData);
        await connection.commit();

        res.json(new ApiResponse(200, null, 'Data updated successfully'));
    } catch (error) {
        await connection.rollback();
        handleError(error, next);
    } finally {
        connection.release();
    }
};

export const addHelpSupportController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { name, phone_number, issue } = req.body;

        if (!name || !issue) throw new CustomError(400, 'Name and issue are required');

        await connection.query(
            'INSERT INTO help_support (name, phone_number, issue) VALUES (?, ?, ?)',
            [name, phone_number, issue]
        );

        await connection.commit();

        res.json(new ApiResponse(201, null, 'Help and support request added successfully'));
    } catch (error) {
        await connection.rollback();
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};

