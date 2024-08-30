import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';

export const createSubscriptionBenefitController = async (req, res, next) => {
    try {
        const { subscription_id, benefit_text } = req.body;

        const query = 'INSERT INTO subscription_benefits (subscription_id, benefit_text) VALUES (?, ?)';
        const [result] = await pool.query(query, [subscription_id, benefit_text]);

        res.status(201).json(new ApiResponse(201, { id: result.insertId }, 'Subscription benefit created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getSubscriptionBenefitsController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM subscription_benefits WHERE subscription_id = ? ORDER BY createdAt DESC';
        const [rows] = await pool.query(query, [id]);

        if (!rows.length) throw new CustomError(404, 'No benefits found for this subscription');

        res.json(new ApiResponse(200, { benefits: rows }));
    } catch (error) {
        next(error);
    }
};

export const updateSubscriptionBenefitController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { benefit_text } = req.body;

        const query = 'UPDATE subscription_benefits SET benefit_text = ? WHERE id = ?';
        const [result] = await pool.query(query, [benefit_text, id]);

        if (result.affectedRows === 0) throw new CustomError(404, 'Subscription benefit not found');

        res.json(new ApiResponse(200, null, 'Subscription benefit updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteSubscriptionBenefitController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM subscription_benefits WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) throw new CustomError(404, 'Subscription benefit not found');

        res.json(new ApiResponse(200, null, 'Subscription benefit deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
