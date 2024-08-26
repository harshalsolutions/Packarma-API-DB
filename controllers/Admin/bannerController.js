import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';
import { unlink } from 'fs';
import { __dirname } from "../../app.js"

export const getAllBannerController = async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT 
                b.*,
                COALESCE(activity.total_views, 0) AS total_views,
                COALESCE(activity.total_clicks, 0) AS total_clicks
            FROM 
                banner b
            LEFT JOIN 
                (
                    SELECT 
                        banner_id,
                        COUNT(CASE WHEN activity_type = 'view' THEN 1 END) AS total_views,
                        COUNT(CASE WHEN activity_type = 'click' THEN 1 END) AS total_clicks
                    FROM 
                        banner_activity
                    GROUP BY 
                        banner_id
                ) AS activity ON b.id = activity.banner_id
        `;

        const queryParams = [];

        if (status) {
            query += ' WHERE b.status = ?';
            queryParams.push(status);
        }

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) throw new CustomError(404, 'No banners found');

        res.json(new ApiResponse(200, rows));
    } catch (error) {
        next(error);
    }
};


export const getBannerController = async (req, res, next) => {
    try {
        const bannerId = req.params.id;

        let query = `
        SELECT 
            b.*,
            COALESCE(activity.total_views, 0) AS total_views,
            COALESCE(activity.total_clicks, 0) AS total_clicks
        FROM 
            banner b
        LEFT JOIN 
            (
                SELECT 
                    banner_id,
                    COUNT(CASE WHEN activity_type = 'view' THEN 1 END) AS total_views,
                    COUNT(CASE WHEN activity_type = 'click' THEN 1 END) AS total_clicks
                FROM 
                    banner_activity
                WHERE 
                    banner_id = ?
                GROUP BY 
                    banner_id
            ) AS activity ON b.id = activity.banner_id
        WHERE 
            b.id = ?
    `;

        const [rows] = await pool.query(query, [bannerId, bannerId]);

        if (!rows.length) throw new CustomError(404, 'Banner not found');

        res.json(new ApiResponse(200, rows[0]));
    } catch (error) {
        next(error);
    }
};



export const createBannerController = async (req, res, next) => {
    try {
        const { title, description, start_date_time, end_date_time, link, app_page } = req.body;

        let banner_image = null;
        if (req.file) {
            banner_image = `/media/${req.body.type}/${req.file.filename}`;
        }

        const query = 'INSERT INTO banner (title, description, start_date_time, end_date_time, link, app_page, banner_image) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [title, description, start_date_time, end_date_time, link, app_page, banner_image]);

        res.status(201).json(new ApiResponse(201, null, 'Banner created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
export const updateBannerController = async (req, res, next) => {
    try {
        const bannerId = req.params.id;
        const updateData = req.body;
        delete updateData.type;
        if (req.file) {
            const [existingBannerRows] = await pool.query('SELECT banner_image FROM banner WHERE id = ?', [bannerId]);
            if (!existingBannerRows.length) throw new CustomError(404, 'Banner not found');

            const oldFilePath = existingBannerRows[0].banner_image;

            if (oldFilePath) {
                const absolutePath = __dirname + oldFilePath.replaceAll("/", "\\")
                unlink(absolutePath, (err) => {
                    if (err) console.error(`Error deleting file: ${err.message}`);
                });
            }

            updateData.banner_image = `/media/banner/${req.file.filename}`;
        }

        const fields = Object.keys(updateData).map(field => `${field} = ? `).join(', ');
        const values = [...Object.values(updateData), bannerId];

        const query = `UPDATE banner SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ? `;
        await pool.query(query, values);

        res.json(new ApiResponse(200, null, 'Banner updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const deleteBannerController = async (req, res, next) => {
    try {
        const bannerId = req.params.id;
        const [existingBannerRows] = await pool.query('SELECT banner_image FROM banner WHERE id = ?', [bannerId]);
        if (!existingBannerRows.length) throw new CustomError(404, 'Banner not found');
        const oldFilePath = existingBannerRows[0].banner_image;
        if (oldFilePath) {
            const absolutePath = __dirname + oldFilePath.replaceAll("/", "\\")
            unlink(absolutePath, (err) => {
                if (err) console.error(`Error deleting file: ${err.message}`);
            });
        }
        await pool.query('DELETE FROM banner WHERE id = ?', [bannerId]);
        res.json(new ApiResponse(200, null, 'Banner deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getBannerActivityStatsController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [activityStats] = await pool.query(
            `SELECT 
                banner_id,
                    IFNULL(SUM(activity_type = 'view'), 0) AS total_views,
                    IFNULL(SUM(activity_type = 'click'), 0) AS total_clicks
            FROM banner_activity
            WHERE banner_id = ?
                    GROUP BY banner_id`,
            [id]
        );

        if (!activityStats.length) {
            return res.json(new ApiResponse(404, null, 'No activity found for this banner'));
        }

        const [userActivity] = await pool.query(
            `SELECT 
                u.user_id,
                    u.firstname,
                    u.lastname,
                    u.email,
                    ba.activity_type,
                    ba.activity_timestamp
            FROM banner_activity ba
            JOIN users u ON ba.user_id = u.user_id
            WHERE ba.banner_id = ? `,
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