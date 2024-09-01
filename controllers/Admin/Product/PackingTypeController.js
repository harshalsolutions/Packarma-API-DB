import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from '../../../utils/CustomError.js';

export const createPackingTypeController = async (req, res, next) => {
    try {
        const { name, short_description } = req.body;
        const query = 'INSERT INTO packing_type (name, short_description) VALUES (?, ?)';
        await pool.query(query, [name, short_description]);
        res.status(201).json(new ApiResponse(201, null, 'Packing Type created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getProductFormController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM packing_type WHERE id = ?', [id]);
        if (!rows.length) res.json(new ApiResponse(200, {}, 'No Product Form found'));

        res.json(new ApiResponse(200, rows[0], 'Product Form retrieved successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updatePackingTypeController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const [existingPackingTypeRows] = await pool.query('SELECT * FROM packing_type WHERE id = ?', [id]);
        if (!existingPackingTypeRows.length) throw new CustomError(404, 'Packing Type not found');

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const query = `UPDATE packing_type SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Packing Type updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deletePackingTypeController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [existingPackingTypeRows] = await pool.query('SELECT image FROM packing_type WHERE id = ?', [id]);
        if (!existingPackingTypeRows.length) throw new CustomError(404, 'Packing Type not found');

        const oldFilePath = existingPackingTypeRows[0].image;
        if (oldFilePath) {
            const absolutePath = path.join(process.cwd(), oldFilePath);
            unlink(absolutePath, (err) => {
                if (err) console.error(`Error deleting file: ${err.message}`);
            });
        }

        await pool.query('DELETE FROM packing_type WHERE id = ?', [id]);
        res.json(new ApiResponse(200, null, 'Packing Type deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAllPackingTypesController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query('SELECT * FROM packing_type ORDER BY createdAt DESC LIMIT ? OFFSET ?', [parseInt(limit), offset]);
        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM packing_type');

        const total = totalCount[0].count;
        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: Number(page),
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: Number(limit)
        };

        res.json(new ApiResponse(200, { packingTypes: rows, pagination }, "Packing Types retrieved successfully"));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};