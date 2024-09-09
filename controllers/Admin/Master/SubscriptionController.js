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
                IFNULL(s.benefits, '') AS benefits
            FROM 
                subscriptions s
            WHERE
                s.deleted_at IS NULL
            LIMIT ? OFFSET ?;
        `;

        const [rows] = await pool.query(query, [Number(limit), Number(offset)]);

        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM subscriptions WHERE deleted_at IS NULL');

        if (!rows.length) throw new CustomError(404, 'No subscriptions found');

        const total = totalCount[0].count;
        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: Number(page),
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: Number(limit)
        };

        res.json(new ApiResponse(200, {
            subscriptions: rows,
            pagination
        }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const createSubscriptionController = async (req, res, next) => {
    try {
        const { type, amount, credit_amount, duration, benefits = '' } = req.body;

        const query = 'INSERT INTO subscriptions (type, amount, credit_amount, duration, benefits) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [type, amount, credit_amount, duration, benefits]);

        res.status(201).json(new ApiResponse(201, { id: result.insertId }, 'Subscription created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateSubscriptionController = async (req, res, next) => {
    try {
        const subscriptionId = req.params.id;
        const { type, amount, credit_amount, duration, benefits } = req.body;

        const query = `
            UPDATE subscriptions 
            SET type = ?, amount = ?, credit_amount = ?, duration = ?, benefits = ?
            WHERE id = ? AND deleted_at IS NULL
        `;
        const [result] = await pool.query(query, [type, amount, credit_amount, duration, benefits, subscriptionId]);

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
