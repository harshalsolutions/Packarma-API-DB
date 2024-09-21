import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';
import { currencyData } from '../../../currency.js';

export const getAllSubscriptionsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const query = `
            SELECT s.id, s.type, s.credit_amount, s.duration, s.benefits, s.sequence, s.deleted_at, s.createdAt, s.updatedAt,
            GROUP_CONCAT(CONCAT(ps.price, ':', ps.currency, ':', ps.status) SEPARATOR '|') AS prices
            FROM subscriptions s
            JOIN subscriptions_prices ps ON s.id = ps.subscription_id
            GROUP BY s.id
            ORDER BY s.sequence
            LIMIT ? OFFSET ?;
        `;

        const [rows] = await pool.query(query, [Number(limit), Number(offset)]);

        rows.map((row) => {
            row.prices = row.prices.split('|').map((price) => {
                const [priceValue, currency, status] = price.split(':');
                return { price: priceValue, currency, status };
            });

            row.benefits = row.benefits ? row.benefits.split("#") : [];
        });

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
        const { type, credit_amount, duration, benefits = '' } = req.body;

        const query = 'INSERT INTO subscriptions (type, credit_amount, duration, benefits) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [type, credit_amount, duration, benefits]);

        res.status(201).json(new ApiResponse(201, { id: result.insertId }, 'Subscription created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateSubscriptionController = async (req, res, next) => {
    try {
        const subscriptionId = req.params.id;
        const fields = Object.keys(req.body);
        const values = [...Object.values(req.body), subscriptionId];

        const query = `
            UPDATE subscriptions 
            SET ${fields.map(field => `${field} = ?`).join(', ')}
            WHERE id = ?
        `;
        const [result] = await pool.query(query, values);

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

export const getAllCurrencyController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = 'SELECT DISTINCT currency FROM subscriptions_prices WHERE subscription_id = ?';
        const [currencyRows] = await pool.query(query, [id]);
        const currencyArray = Object.keys(currencyData)
            .filter((key) => !currencyRows.some((row) => row.code === key))
            .map((key) => ({
                code: key,
                symbol: currencyData[key].symbol,
                name: currencyData[key].name,
            }));
        res.json(new ApiResponse(200, { currencies: currencyArray }, 'Currency Data successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
}

export const getSubscriptionPriceController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const query = 'SELECT * FROM subscriptions_prices WHERE subscription_id = ?';
        const [rows] = await pool.query(query, [id]);

        if (!rows.length) throw new CustomError(404, 'Subscription price not found');

        res.json(new ApiResponse(200, rows, 'Subscription price retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
export const addSubscriptionPriceController = async (req, res, next) => {
    try {
        const { subscription_id, price, currency, status } = req.body;

        const query = 'INSERT INTO subscriptions_prices (subscription_id, price, currency, status) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(query, [subscription_id, price, currency, status]);

        res.json(new ApiResponse(201, { id: result.insertId }, 'Subscription price added successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateSubscriptionPriceController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const fields = Object.keys(req.body);
        const values = [...Object.values(req.body), id];

        const query = `
            UPDATE subscriptions_prices 
            SET ${fields.map(field => `${field} = ?`).join(', ')}
            WHERE id = ?
        `;
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) throw new CustomError(404, 'Subscription price not found');

        res.json(new ApiResponse(200, null, 'Subscription price updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteSubscriptionPriceController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM subscriptions_prices WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) throw new CustomError(404, 'Subscription price not found');

        res.json(new ApiResponse(200, null, 'Subscription price deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
