import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';

export const getAllCountriesController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const countQuery = 'SELECT COUNT(*) as total FROM country WHERE deleted_at IS NULL';
        const [countResult] = await pool.query(countQuery);
        const total = countResult[0].total;

        const query = 'SELECT * FROM country WHERE deleted_at IS NULL ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(query, [limit, offset]);

        if (!rows.length) throw new CustomError(404, 'No countries found');

        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.json(new ApiResponse(200, { countries: rows, pagination }));
    } catch (error) {
        next(error);
    }
};

export const createCountryController = async (req, res, next) => {
    try {
        const { name, code } = req.body;

        const query = 'INSERT INTO country (name, code) VALUES (?, ?)';
        await pool.query(query, [name, code]);

        res.status(201).json(new ApiResponse(201, null, 'Country created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateCountryController = async (req, res, next) => {
    try {
        const countryId = req.params.id;
        const updateFields = req.body;

        const allowedFields = ['country_name', 'phone_code', 'phone_length', 'currency_id', 'status'];
        const setClause = [];
        const params = [];

        for (const [key, value] of Object.entries(updateFields)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                params.push(value);
            }
        }

        if (setClause.length === 0) {
            return next(new CustomError(400, 'No valid fields to update'));
        }

        params.push(countryId);
        const query = `UPDATE country SET ${setClause.join(', ')} WHERE id = ? AND deleted_at IS NULL`;

        await pool.query(query, params);

        res.json(new ApiResponse(200, null, 'Country updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteCountryController = async (req, res, next) => {
    try {
        const countryId = req.params.id;

        const query = 'UPDATE country SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        await pool.query(query, [countryId]);

        res.json(new ApiResponse(200, null, 'Country deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllStatesController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM state s
            JOIN country c ON s.country_id = c.id
            WHERE s.deleted_at IS NULL AND c.deleted_at IS NULL
        `;
        const [countResult] = await pool.query(countQuery);
        const total = countResult[0].total;

        const query = `
            SELECT s.*, c.country_name
            FROM state s
            JOIN country c ON s.country_id = c.id
            WHERE s.deleted_at IS NULL AND c.deleted_at IS NULL
            ORDER BY s.createdAt DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query(query, [limit, offset]);

        if (!rows.length) throw new CustomError(404, 'No states found');

        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.json(new ApiResponse(200, { states: rows, pagination }));
    } catch (error) {
        next(error);
    }
};

export const createStateController = async (req, res, next) => {
    try {
        const { state_name, country_id } = req.body;

        const query = 'INSERT INTO state (state_name, country_id) VALUES (?, ?)';
        await pool.query(query, [state_name, country_id]);

        res.status(201).json(new ApiResponse(201, null, 'State created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateStateController = async (req, res, next) => {
    try {
        const stateId = req.params.id;
        const updateFields = req.body;

        const allowedFields = ['state_name', 'country_id', 'status'];
        const setClause = [];
        const params = [];

        for (const [key, value] of Object.entries(updateFields)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = ?`);
                params.push(value);
            }
        }

        if (setClause.length === 0) {
            return next(new CustomError(400, 'No valid fields to update'));
        }

        params.push(stateId);
        const query = `UPDATE state SET ${setClause.join(', ')} WHERE id = ? AND deleted_at IS NULL`;

        await pool.query(query, params);

        res.json(new ApiResponse(200, null, 'State updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteStateController = async (req, res, next) => {
    try {
        const stateId = req.params.id;

        const query = 'UPDATE state SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        await pool.query(query, [stateId]);

        res.json(new ApiResponse(200, null, 'State deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
