import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';

export const getAllSubscriptionsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const query = `
           SELECT 
                s.*, 
                JSON_ARRAYAGG(sb.benefit_text) AS benefits
            FROM 
                subscriptions s
            LEFT JOIN 
                subscription_benefits sb 
            ON 
                s.id = sb.subscription_id
            GROUP BY 
                s.id
            LIMIT ? OFFSET ?;
        `;

        const [rows] = await pool.query(query, [Number(limit), Number(offset)]);

        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM subscriptions WHERE deleted_at IS NULL');

        if (!rows.length) throw new CustomError(404, 'No subscriptions found');

        res.json(new ApiResponse(200, rows, 'Subscriptions fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const createSubscriptionController = async (req, res, next) => {
    try {
        const { type, amount, credit_amount, duration } = req.body;

        const query = 'INSERT INTO subscriptions (type, amount, credit_amount, duration) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(query, [type, amount, credit_amount, duration]);

        res.status(201).json(new ApiResponse(201, { id: result.insertId }, 'Subscription created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateSubscriptionController = async (req, res, next) => {
    try {
        const subscriptionId = req.params.id;
        const { type, amount, credit_amount, duration } = req.body;

        const query = `
            UPDATE subscriptions 
            SET type = ?, amount = ?, credit_amount = ?, duration = ?
            WHERE id = ? AND deleted_at IS NULL
        `;
        const [result] = await pool.query(query, [type, amount, credit_amount, duration, subscriptionId]);

        if (result.affectedRows === 0) throw new CustomError(404, 'Subscription not found');

        res.json(new ApiResponse(200, null, 'Subscription updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteSubscriptionController = async (req, res, next) => {
    try {
        const subscriptionId = req.params.id;

        const query = 'UPDATE subscriptions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL';
        const [result] = await pool.query(query, [subscriptionId]);

        if (result.affectedRows === 0) throw new CustomError(404, 'Subscription not found');

        res.json(new ApiResponse(200, null, 'Subscription deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
