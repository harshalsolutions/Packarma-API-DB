import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { formatDateTime } from '../../../utils/dateFormatter.js';

export const getAllAdvertisementController = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10, search } = req.query;

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
        if (search) {
            query += status ? ' AND' : ' WHERE';
            query += ' a.title LIKE ?';
            queryParams.push(`%${search}%`);
        }

        query += ' GROUP BY a.id ORDER BY a.sequence';
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

export const exportAdvertisementControllerById = async (req, res, next) => {
    try {
        const advertisementId = req.params.id;
        const { type } = req.query;
        const { link } = req.body;

        if (!['click', 'view'].includes(type)) {
            throw new CustomError(400, 'Invalid type parameter. Must be "click" or "view".');
        }

        const [advertisementRows] = await pool.query(`
            SELECT 
                a.title,
                a.description,
                a.createdAt,
                a.updatedAt,
                a.image,
                COALESCE(activity.total_views, 0) AS total_views,
                COALESCE(activity.total_clicks, 0) AS total_clicks
            FROM 
                advertisement a
            LEFT JOIN 
                (
                    SELECT 
                        advertisement_id,
                        COUNT(CASE WHEN activity_type = 'view' THEN 1 END) AS total_views,
                        COUNT(CASE WHEN activity_type = 'click' THEN 1 END) AS total_clicks
                    FROM 
                        advertisement_activity
                    WHERE 
                        advertisement_id = ?
                    GROUP BY 
                        advertisement_id
                ) AS activity ON a.id = activity.advertisement_id
            WHERE 
                a.id = ?
        `, [advertisementId, advertisementId]);

        if (!advertisementRows.length) throw new CustomError(404, 'Advertisement not found');

        const advertisement = advertisementRows[0];

        const [userActivity] = await pool.query(`
            SELECT 
                u.user_id,
                u.firstname,
                u.lastname,
                u.email,
                aa.activity_type,
                aa.activity_timestamp
            FROM 
                advertisement_activity aa
            JOIN 
                users u ON aa.user_id = u.user_id
            WHERE 
                aa.advertisement_id = ? AND aa.activity_type = ?
        `, [advertisementId, type]);

        const csvData = userActivity.map(activity => ({
            title: advertisement.title,
            description: advertisement.description,
            createdAt: formatDateTime(advertisement.createdAt),
            updatedAt: formatDateTime(advertisement.updatedAt),
            user_id: activity.user_id,
            firstname: activity.firstname,
            lastname: activity.lastname,
            email: activity.email,
            activity_timestamp: formatDateTime(activity.activity_timestamp),
            total_views: advertisement.total_views,
            total_clicks: advertisement.total_clicks,
            image: (link ? link : "") + advertisement.image
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Advertisement ${advertisementId} ${type.charAt(0).toUpperCase() + type.slice(1)}s`);

        worksheet.columns = [
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 30 },
            { header: 'Image', key: 'image', width: 30 },
            { header: 'User ID', key: 'user_id', width: 15 },
            { header: 'First Name', key: 'firstname', width: 15 },
            { header: 'Last Name', key: 'lastname', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Activity Timestamp', key: 'activity_timestamp', width: 20 },
            { header: 'Created At', key: 'createdAt', width: 20 },
            { header: 'Updated At', key: 'updatedAt', width: 20 },
            { header: type === 'click' ? 'Total Clicks' : 'Total Views', key: type === 'click' ? 'total_clicks' : 'total_views', width: 15 }
        ];

        worksheet.addRows(csvData);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`advertisement_${advertisementId}_${type}_${new Date().toISOString()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
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

        const [[{ totalCount }]] = await pool.query('SELECT COUNT(*) as totalCount FROM advertisement');

        const query = 'INSERT INTO advertisement (title, description, start_date_time, end_date_time, link, app_page, image, sequence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [title, description, start_date_time, end_date_time, link, app_page, image, totalCount + 1]);

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
