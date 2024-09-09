import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';

export const getAllAdvertisementController = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT 
                a.*,
                IFNULL(SUM(aa.activity_type = 'view'), 0) as total_views,
                IFNULL(SUM(aa.activity_type = 'click'), 0) as total_clicks,
                JSON_ARRAYAGG(JSON_OBJECT(
                    'product_id', p.id,
                    'product_name', p.product_name,
                    'product_image', p.product_image
                )) as products
            FROM advertisement a
            LEFT JOIN advertisement_activity aa ON a.id = aa.advertisement_id
            LEFT JOIN advertisement_product ap ON a.id = ap.advertisement_id
            LEFT JOIN product p ON ap.product_id = p.id
        `;

        const queryParams = [];
        if (status) {
            query += ' WHERE a.status = ?';
            queryParams.push(status);
        }

        query += ' GROUP BY a.id';
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), (Number(page) - 1) * Number(limit));

        const [rows] = await pool.query(query, queryParams);

        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM advertisement a ${status ? 'WHERE a.status = ?' : ''}`, status ? [status] : []);

        const totalPages = Math.ceil(totalCount / limit);

        if (!rows.length) {
            return res.json(new ApiResponse(200, { advertisements: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No advertisements found'));
        }

        res.json(new ApiResponse(200, {
            advertisements: rows,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        next(error);
    }
};

export const getAdvertisementController = async (req, res, next) => {
    try {
        const advertisementId = req.params.id;

        let query = `
            SELECT 
                a.*,
                IFNULL(SUM(aa.activity_type = 'view'), 0) as total_views,
                IFNULL(SUM(aa.activity_type = 'click'), 0) as total_clicks,
                JSON_ARRAYAGG(JSON_OBJECT(
                    'product_id', p.id,
                    'product_name', p.product_name,
                    'product_image', p.product_image
                )) as products
            FROM advertisement a
            LEFT JOIN advertisement_activity aa ON a.id = aa.advertisement_id
            LEFT JOIN advertisement_product ap ON a.id = ap.advertisement_id
            LEFT JOIN product p ON ap.product_id = p.id
            WHERE a.id = ?
            GROUP BY a.id
        `;

        const [rows] = await pool.query(query, [advertisementId]);

        if (!rows.length) throw new CustomError(404, 'Advertisement not found');

        res.json(new ApiResponse(200, rows[0]));
    } catch (error) {
        next(error);
    }
};

export const createAdvertisementController = async (req, res, next) => {
    try {
        const { title, description, start_date_time, end_date_time, link, app_page } = req.body;

        let image = null;
        if (req.file) {
            image = `/media/advertisement/${req.file.filename}`;
        }

        const query = 'INSERT INTO advertisement (title, description, start_date_time, end_date_time, link, app_page, image) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [title, description, start_date_time, end_date_time, link, app_page, image]);

        res.status(201).json(new ApiResponse(201, null, 'Advertisement created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateAdvertisementController = async (req, res, next) => {
    try {
        const advertisementId = req.params.id;
        const updateData = req.body;
        delete req.body.type

        if (req.file) {
            const [existingAdRows] = await pool.query('SELECT image FROM advertisement WHERE id = ?', [advertisementId]);
            if (!existingAdRows.length) throw new CustomError(404, 'Advertisement not found');

            const oldFilePath = existingAdRows[0].advertisement_image;

            if (oldFilePath) {
                const absolutePath = path.join(process.cwd(), oldFilePath);
                unlink(absolutePath, (err) => {
                    if (err) console.error(`Error deleting file: ${err.message}`);
                });
            }

            updateData.image = `/media/advertisement/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), advertisementId];

        const query = `UPDATE advertisement SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Advertisement updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const deleteAdvertisementController = async (req, res, next) => {
    try {
        const advertisementId = req.params.id;

        const [existingAdRows] = await pool.query('SELECT image FROM advertisement WHERE id = ?', [advertisementId]);
        if (!existingAdRows.length) throw new CustomError(404, 'Advertisement not found');

        const oldFilePath = existingAdRows[0].image;

        if (oldFilePath) {
            const absolutePath = path.join(process.cwd(), oldFilePath);
            unlink(absolutePath, (err) => {
                if (err) console.error(`Error deleting file: ${err.message}`);
            });
        }

        await pool.query('DELETE FROM advertisement WHERE id = ?', [advertisementId]);

        res.json(new ApiResponse(200, null, 'Advertisement deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAdvertisementActivityStatsController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [activityStats] = await pool.query(
            `SELECT 
                advertisement_id,
                IFNULL(SUM(activity_type = 'view'), 0) AS total_views,
                IFNULL(SUM(activity_type = 'click'), 0) AS total_clicks
            FROM advertisement_activity
            WHERE advertisement_id = ?
            GROUP BY advertisement_id`,
            [id]
        );

        if (!activityStats.length) {
            return res.json(new ApiResponse(404, null, 'No activity found for this advertisement'));
        }

        const [userActivity] = await pool.query(
            `SELECT 
                u.user_id, 
                u.firstname, 
                u.lastname, 
                u.email, 
                aa.activity_type, 
                aa.activity_timestamp
            FROM advertisement_activity aa
            JOIN users u ON aa.user_id = u.user_id
            WHERE aa.advertisement_id = ?`,
            [id]
        );

        const userData = {
            views: [],
            clicks: []
        };

        userActivity.forEach(activity => {
            const userInfo = {
                user_id: activity.user_id,
                firstname: activity.firstname,
                lastname: activity.lastname,
                email: activity.email,
                activity_timestamp: activity.activity_timestamp
            };
            if (activity.activity_type === 'view') {
                userData.views.push(userInfo);
            } else if (activity.activity_type === 'click') {
                userData.clicks.push(userInfo);
            }
        });

        res.json(new ApiResponse(200, {
            activityStats: activityStats[0],
            userData
        }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
