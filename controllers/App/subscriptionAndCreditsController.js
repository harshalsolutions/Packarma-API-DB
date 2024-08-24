import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';

export const modifyCredits = async (req, res, next) => {
    const { credits, description } = req.body;
    const userId = req.user.userId;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [rows] = await connection.query('SELECT credits FROM users WHERE user_id = ?', [userId]);
            if (!rows.length) throw new CustomError(404, 'User not found');

            const currentCredits = rows[0].credits;
            const newCredits = currentCredits + credits;

            await connection.query('UPDATE users SET credits = ?, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?', [newCredits, userId]);

            await connection.query(
                'INSERT INTO credit_history (user_id, change_amount, description) VALUES (?, ?, ?)',
                [userId, credits, description || (credits > 0 ? 'Credit added' : 'Credit deducted')]
            );

            await connection.commit();
            res.json(new ApiResponse(200, { credits: newCredits }, 'Credits updated successfully'));
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

export const getCreditHistory = async (req, res, next) => {
    const userId = req.user.userId;

    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                'SELECT * FROM credit_history WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            if (rows.length === 0) {
                return res.json(new ApiResponse(404, null, 'No credit history found for this user'));
            }
            res.json(new ApiResponse(200, rows, 'Credit history retrieved successfully'));
        } catch (error) {
            handleError(error, next);
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};



export const addUserSubscription = async (req, res, next) => {
    const { subscriptionId, startDate, endDate } = req.body;
    const userId = req.user.userId;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [rows] = await connection.query('SELECT id FROM subscriptions WHERE id = ?', [subscriptionId]);
            if (!rows.length) throw new CustomError(404, 'Subscription not found');

            await connection.query(
                'INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date) VALUES (?, ?, ?, ?)',
                [userId, subscriptionId, startDate, endDate]
            );

            await connection.commit();
            res.status(201).json(new ApiResponse(201, null, 'Subscription added successfully'));
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