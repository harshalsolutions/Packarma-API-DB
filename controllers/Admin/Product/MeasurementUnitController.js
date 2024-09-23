import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';

export const createMeasurementUnitController = async (req, res, next) => {
    try {
        const { name, symbol, status } = req.body;
        const query = 'INSERT INTO measurement_unit (name, symbol, status) VALUES (?, ?, ?)';
        await pool.query(query, [name.trim(), symbol, status]);
        res.status(201).json(new ApiResponse(201, null, 'Measurement Unit created successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));
        next(new CustomError(500, error.message));
    }
};

export const getMeasurementUnitController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM measurement_unit WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {}, 'No Measurement Unit found'));

        res.json(new ApiResponse(200, rows[0], 'Measurement Unit retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateMeasurementUnitController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const [existingMeasurementUnitRows] = await pool.query('SELECT * FROM measurement_unit WHERE id = ?', [id]);
        if (!existingMeasurementUnitRows.length) throw new CustomError(404, 'Measurement Unit not found');

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE measurement_unit SET ${fields}${fields.length ? ', updatedAt = CURRENT_TIMESTAMP' : ''} WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Measurement Unit updated successfully'));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return next(new CustomError(409, 'Already Created!!'));

        next(new CustomError(500, error.message));
    }
};

export const deleteMeasurementUnitController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingMeasurementUnitRows] = await pool.query('SELECT * FROM measurement_unit WHERE id = ?', [id]);
        if (!existingMeasurementUnitRows.length) throw new CustomError(404, 'Measurement Unit not found');

        await pool.query('DELETE FROM measurement_unit WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Measurement Unit deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllMeasurementUnitsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, pagination = 'true' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM measurement_unit ORDER BY createdAt DESC';
        const queryParams = [];

        if (pagination === 'true') {
            query += ' LIMIT ? OFFSET ?';
            queryParams.push(parseInt(limit), offset);
        }

        const [rows] = await pool.query(query, queryParams);
        if (pagination === 'true') {
            const total = rows.length;
            const totalPages = Math.ceil(total / limit);
            const paginationData = {
                currentPage: Number(page),
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: Number(limit)
            };

            res.json(new ApiResponse(200, { measurementUnits: rows, pagination: paginationData }, "Measurement Units retrieved successfully"));
        } else {
            res.json(new ApiResponse(200, { measurementUnits: rows }, "Measurement Units retrieved successfully"));
        }
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};