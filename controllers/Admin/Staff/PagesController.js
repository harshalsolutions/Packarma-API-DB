import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';
import { handleError } from "../../../utils/ErrorHandler.js"

export const addPageController = async (req, res, next) => {
    try {
        const { page_name } = req.body;
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [existingPage] = await connection.query('SELECT * FROM pages WHERE page_name = ?', [page_name]);
            if (existingPage.length) throw new CustomError(400, 'Page already exists');

            const [result] = await connection.query(
                'INSERT INTO pages (page_name) VALUES (?)',
                [page_name]
            );
            const pageId = result.insertId;

            await connection.commit();
            res.status(201).json(new ApiResponse(201, { pageId }, 'Page created successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};

export const updatePageController = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const { page_name } = req.body;
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [existingPage] = await connection.query('SELECT * FROM pages WHERE id = ?', [pageId]);
            if (!existingPage.length) throw new CustomError(404, 'Page not found');

            await connection.query(
                'UPDATE pages SET page_name = ? WHERE id = ?',
                [page_name, pageId]
            );

            await connection.commit();
            res.json(new ApiResponse(200, null, 'Page updated successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};

export const deletePageController = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [result] = await connection.query('DELETE FROM pages WHERE id = ?', [pageId]);
            if (result.affectedRows === 0) throw new CustomError(404, 'Page not found');

            await connection.commit();
            res.json(new ApiResponse(200, null, 'Page deleted successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        handleError(error, next);
    }
};

export const getPageController = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const [rows] = await pool.query('SELECT * FROM pages WHERE id = ?', [pageId]);
        if (!rows.length) throw new CustomError(404, 'Page not found');

        res.json(new ApiResponse(200, rows[0], 'Page data retrieved successfully'));
    } catch (error) {
        handleError(error, next);
    }
};

export const getAllPagesController = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const [rows] = await pool.query('SELECT * FROM pages');
        const totalCount = rows.length;
        const totalPages = Math.ceil(totalCount / limit);
        res.json(new ApiResponse(200, {
            pages: rows,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        handleError(error, next);
    }
};
