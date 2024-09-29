import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';
import { currencyData } from "../../../currency.js"
export const getAllCreditPricesController = async (req, res, next) => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM credit_prices';
        let countQuery = 'SELECT COUNT(*) as count FROM credit_prices';
        const queryParams = [parseInt(limit), parseInt(offset)];
        const countParams = [];

        if (search) {
            query += ' WHERE currency LIKE ? OR price LIKE ?';
            countQuery += ' WHERE currency LIKE ? OR price LIKE ?';
            queryParams.unshift(`%${search}%`, `%${search}%`);
            countParams.unshift(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY id DESC LIMIT ? OFFSET ?';

        const [rows] = await pool.query(query, queryParams);
        if (!rows.length) throw new CustomError(404, 'No Credit Prices found');

        const [totalCount] = await pool.query(countQuery, countParams);
        const total = totalCount[0].count;

        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: Number(page),
            totalPages,
            totalItems: total,
            itemsPerPage: Number(limit),
        };

        res.json(new ApiResponse(200, { creditPrices: rows, pagination }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getCreditPriceByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM credit_prices WHERE id = ?';
        const [rows] = await pool.query(query, [id]);

        if (!rows.length) throw new CustomError(404, 'Credit Price not found');

        res.json(new ApiResponse(200, rows[0]));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const createCreditPriceController = async (req, res, next) => {
    try {
        const { price, percentage, currency, status, country } = req.body;

        const query = `
            INSERT INTO credit_prices (price, percentage, currency, status, country)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [price, percentage, currency, status]);

        res.json(new ApiResponse(201, { id: result.insertId }, 'Credit Price created successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const updateCreditPriceController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { price, percentage, currency, status, country } = req.body;

        const query = `
            UPDATE credit_prices 
            SET price = ?, percentage = ?, currency = ?, status = ?, country = ? , updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [price, percentage, currency, status, country, id]);

        if (result.affectedRows === 0) throw new CustomError(404, 'Credit Price not found');

        res.json(new ApiResponse(200, null, 'Credit Price updated successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const deleteCreditPriceController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM credit_prices WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) throw new CustomError(404, 'Credit Price not found');

        res.json(new ApiResponse(200, null, 'Credit Price deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const getAllCurrencyController = async (req, res, next) => {
    try {
        const query = 'SELECT DISTINCT currency FROM credit_prices';
        const [currencyRows] = await pool.query(query);
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
