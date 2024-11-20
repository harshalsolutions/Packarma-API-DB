import ApiResponse from "../../utils/ApiResponse.js";
import pool from "../../config/database.js";
import generateOTP from "../../utils/otpGenerator.js";
import sendOtpEmail from "../../utils/emailSender.js";
import CustomError from "../../utils/CustomError.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { generateReferralCode } from "../../utils/generateReferalCode.js";
import { handleError } from "../../utils/ErrorHandler.js";
import crypto from "crypto";
dotenv.config();

const generateToken = (userId, email) =>
  jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerController = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      referralCode,
      phone_number,
      type = "normal",
    } = req.body;
    const hashedPassword = crypto
      .createHash("md5")
      .update(email + password)
      .digest("hex");
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [userResult] = await connection.query(
        "INSERT INTO users (firstname, lastname, email, password, type, phone_number) VALUES (?, ?, ?, ?, ?, ?)",
        [firstname, lastname, email, hashedPassword, type, phone_number],
      );
      const userId = userResult.insertId;
      const newReferralCode = generateReferralCode(10);
      if (referralCode) {
        const [referralCodeResult] = await connection.query(
          "SELECT id FROM referral_codes WHERE code = ?",
          [referralCode],
        );
        if (referralCodeResult.length > 0) {
          const referralCodeId = referralCodeResult[0].id;
          await connection.query(
            "INSERT INTO referrals (referral_code_id, referred_user_id, account_created) VALUES (?, ?, ?)",
            [referralCodeId, userId, true],
          );
        } else {
          throw new CustomError(400, "Invalid referral code");
        }
      }
      const [newReferralCodeResult] = await connection.query(
        "INSERT INTO referral_codes (user_id, code) VALUES (?, ?)",
        [userId, newReferralCode],
      );
      const newReferralCodeId = newReferralCodeResult.insertId;
      await connection.query(
        "UPDATE users SET referral_code_id = ? WHERE user_id = ?",
        [newReferralCodeId, userId],
      );
      await connection.commit();
      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { referralCode: newReferralCode },
            "User registered successfully",
          ),
        );
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("email")) {
          throw new CustomError(409, "Email address is already registered");
        } else if (errorMessage.includes("phone_number")) {
          throw new CustomError(409, "Phone number is already registered");
        } else {
          throw new CustomError(409, "A duplicate entry was detected");
        }
      }

      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password)
      throw new CustomError(400, "Email and password are required");
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows.length) throw new CustomError(404, "User not found");

    const user = rows[0];
    if (user.block) throw new CustomError(403, "User is blocked");

    if (!user.email_verified) {
      throw new CustomError(403, "Please verify your email before logging in.");
    }

    const md5HashedPassword = crypto
      .createHash("md5")
      .update(email + password)
      .digest("hex");
    if (md5HashedPassword !== user.password)
      throw new CustomError(401, "Invalid credentials");

    const token = generateToken(user.user_id, email);
    const { password: _, ...userWithoutPassword } = user;

    res.json(
      new ApiResponse(
        200,
        { user: userWithoutPassword, token },
        "Login successful",
      ),
    );
  } catch (error) {
    next(error);
  }
};

export const authenticateFirebaseController = async (req, res, next) => {
  try {
    const { email, type, uid, firstname, lastname, referralCode } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length) {
      const user = rows[0];
      if (user.type === "normal") {
        throw new CustomError(400, "User already registered with normal login");
      } else {
        const token = generateToken(user.user_id, email);
        const { password: _, ...userWithoutPassword } = user;
        return res.json(
          new ApiResponse(
            200,
            { user: userWithoutPassword, token },
            "Login successful",
          ),
        );
      }
    } else {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const [userResult] = await connection.query(
          "INSERT INTO users (firstname, lastname, email, type, uid) VALUES (?, ?, ?, ?, ?)",
          [firstname, lastname, email, type, uid],
        );
        const userId = userResult.insertId;
        const newReferralCode = generateReferralCode(10);

        if (referralCode) {
          const [referralCodeResult] = await connection.query(
            "SELECT id FROM referral_codes WHERE code = ?",
            [referralCode],
          );

          if (referralCodeResult.length > 0) {
            const referralCodeId = referralCodeResult[0].id;
            await connection.query(
              "INSERT INTO referrals (referral_code_id, referred_user_id, account_created) VALUES (?, ?, ?)",
              [referralCodeId, userId, true],
            );
          } else {
            throw new CustomError(400, "Invalid referral code");
          }
        }

        const [newReferralCodeResult] = await connection.query(
          "INSERT INTO referral_codes (user_id, code) VALUES (?, ?)",
          [userId, newReferralCode],
        );
        const newReferralCodeId = newReferralCodeResult.insertId;
        await connection.query(
          "UPDATE users SET referral_code_id = ? WHERE user_id = ?",
          [newReferralCodeId, userId],
        );

        const token = generateToken(userId, email);
        await connection.commit();
        res
          .status(201)
          .json(
            new ApiResponse(
              201,
              { token, referralCode: newReferralCode },
              "User registered successfully",
            ),
          );
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
    const fields = Object.keys(updateData)
      .map((field) => `${field} = ?`)
      .join(", ");
    const values = [...Object.values(updateData), userId];

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const query = `UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?`;
      await connection.query(query, values);

      await connection.commit();
      res.json(new ApiResponse(200, null, "User updated successfully"));
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
                us.subscription_id, us.start_date, us.end_date,
                s.type as subscription_name
                FROM users u
                LEFT JOIN referral_codes r ON u.user_id = r.user_id
                LEFT JOIN user_subscriptions us ON u.user_id = us.user_id
                LEFT JOIN subscriptions s ON us.subscription_id = s.id
                WHERE u.user_id = ?
                ORDER BY us.start_date DESC`,
      [userId],
    );

    if (!rows.length) throw new CustomError(404, "User not found");

    let currentSubscription = null;
    const upcomingSubscriptions = [];
    const currentDate = new Date();

    rows.forEach((row) => {
      const subscription = {
        subscription_id: row.subscription_id,
        subscription_name: row.subscription_name,
        start_date: row.start_date,
        end_date: row.end_date,
      };

      if (
        new Date(row.start_date) <= currentDate &&
        new Date(row.end_date) >= currentDate
      ) {
        currentSubscription = subscription;
      } else if (new Date(row.end_date) > currentDate) {
        upcomingSubscriptions.push(subscription);
      }
    });

    upcomingSubscriptions.sort(
      (a, b) => new Date(b.start_date) - new Date(a.start_date),
    );

    const [trialRows] = await pool.query(
      `SELECT 1 FROM user_subscriptions 
       WHERE user_id = ? AND subscription_id = 1 LIMIT 1`,
      [userId],
    );

    const user = {
      ...rows[0],
      ...currentSubscription,
      upcoming_subscriptions: upcomingSubscriptions,
      free_trial_redeem: trialRows.length > 0,
    };

    const { password: _, ...userWithoutPassword } = user;

    res.json(new ApiResponse(200, userWithoutPassword));
  } catch (error) {
    next(error);
  }
};

export const requestOtpController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [userRows] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );

    if (userRows.length === 0) {
      throw new CustomError(404, "User not found");
    }

    const userId = userRows[0].user_id;
    const otpType = "verify_email";

    await pool.query("DELETE FROM otp WHERE user_id = ? AND otp_type = ?", [
      userId,
      otpType,
    ]);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO otp (user_id, otp_type, otp, expiresAt) VALUES (?, ?, ?, ?)",
      [userId, otpType, otp, expiresAt],
    );

    await sendOtpEmail(email, otp);

    res.json(new ApiResponse(200, null, "OTP sent successfully"));
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
        [email],
      );

      if (!rows.length) throw new CustomError(404, "OTP not found");

      const { otp: savedOtp, expiresAt } = rows[0];
      if (savedOtp !== otp || Date.now() > new Date(expiresAt).getTime()) {
        throw new CustomError(400, "Invalid or expired OTP");
      }

      await connection.query(
        "UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP WHERE email = ?",
        [email],
      );

      await connection.query(
        'DELETE FROM otp WHERE user_id = (SELECT user_id FROM users WHERE email = ?) AND otp_type = "verify_email"',
        [email],
      );

      await connection.commit();
      res.json(new ApiResponse(200, null, "Email Verified!"));
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
    const [rows] = await pool.query(
      "SELECT user_id, email FROM users WHERE email = ?",
      [email],
    );
    if (!rows.length) throw new CustomError(404, "User not found");

    const user = rows[0];
    const otpType = "reset_password";

    await pool.query("DELETE FROM otp WHERE user_id = ? AND otp_type = ?", [
      user.user_id,
      otpType,
    ]);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO otp (user_id, otp_type, otp, expiresAt) VALUES (?, ?, ?, ?)",
      [user.user_id, otpType, otp, expiresAt],
    );

    await sendOtpEmail(user.email, otp);

    res.json(
      new ApiResponse(200, null, "OTP sent successfully for password reset"),
    );
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
        [email],
      );

      if (!rows.length)
        throw new CustomError(404, "User not found or OTP expired");

      const { otp: savedOtp, expiresAt } = rows[0];
      if (savedOtp !== otp || Date.now() > new Date(expiresAt).getTime()) {
        throw new CustomError(400, "Invalid or expired OTP");
      }

      const hashedPassword = crypto
        .createHash("md5")
        .update(email + newPassword)
        .digest("hex");

      await connection.query(
        "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?",
        [hashedPassword, email],
      );

      await connection.query(
        'DELETE FROM otp WHERE user_id = (SELECT user_id FROM users WHERE email = ?) AND otp_type = "reset_password"',
        [email],
      );

      await connection.commit();
      res.json(new ApiResponse(200, null, "Password updated successfully"));
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
        "SELECT password, email FROM users WHERE user_id = ?",
        [userId],
      );

      if (!rows.length) throw new CustomError(404, "User not found");

      const { password: hashedPassword, email } = rows[0];

      const md5HashedCurrentPassword = crypto
        .createHash("md5")
        .update(email + currentPassword)
        .digest("hex");

      if (md5HashedCurrentPassword !== hashedPassword) {
        throw new CustomError(400, "Current password is incorrect");
      }

      const newHashedPassword = crypto
        .createHash("md5")
        .update(email + newPassword)
        .digest("hex");

      await connection.query(
        "UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?",
        [newHashedPassword, userId],
      );

      await connection.commit();
      res.json(new ApiResponse(200, null, "Password updated successfully"));
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
    const { email_domain, gst_number, phone_number } = req.body;
    let gst_document_link = null;
    if (req.file) {
      gst_document_link = `/media/${req.body.type}/${req.file.filename}`;
    }

    await connection.beginTransaction();

    const updateData = [];
    let query = "UPDATE users SET ";

    if (email_domain) {
      query += "email_domain = ?, ";
      updateData.push(email_domain);
    }
    if (gst_number) {
      query += "gst_number = ?, ";
      updateData.push(gst_number);
    }
    if (gst_document_link) {
      query += "gst_document_link = ?, ";
      updateData.push(gst_document_link);
    }
    if (phone_number) {
      query += "phone_number = ?, ";
      updateData.push(phone_number);
    }

    query = query.slice(0, -2);
    query += " WHERE user_id = ?";
    updateData.push(userId);

    await connection.query(query, updateData);
    await connection.commit();

    res.json(new ApiResponse(200, null, "Data updated successfully"));
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

    if (!name || !issue)
      throw new CustomError(400, "Name and issue are required");

    await connection.query(
      "INSERT INTO help_support (name, phone_number, issue) VALUES (?, ?, ?)",
      [name, phone_number, issue],
    );

    await connection.commit();

    res.json(
      new ApiResponse(201, null, "Help and support request added successfully"),
    );
  } catch (error) {
    await connection.rollback();
    next(new CustomError(500, error.message));
  } finally {
    connection.release();
  }
};
