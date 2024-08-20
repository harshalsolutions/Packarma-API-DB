import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';

export const getAllAdvertisementController = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT 
                a.id, a.title, a.description, a.start_date_time, a.end_date_time,
                a.link, a.app_page, a.image, a.status, a.createdAt, a.updatedAt,
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

        const [rows] = await pool.query(query, queryParams);
        if (!rows.length) throw new CustomError(404, 'No advertisements found');
        res.json(new ApiResponse(200, rows));
    } catch (error) {
        next(error);
    }
};



export const createAdvertisementController = async (req, res, next) => {
    try {
        const { title, description, start_date_time, end_date_time, link, app_page, status } = req.body;
        const image = req.file ? req.file.filename : null;

        const query = 'INSERT INTO advertisement (title, description, start_date_time, end_date_time, link, app_page, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [title, description, start_date_time, end_date_time, link, app_page, image, status]);

        res.status(201).json(new ApiResponse(201, null, 'Advertisement created successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const updateAdvertisementController = async (req, res, next) => {
    try {
        const advertisementId = req.params.id;
        const updateData = req.body;
        const fields = Object.keys(updateData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updateData), advertisementId];
        const query = `UPDATE advertisement SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
        await pool.query(query, values);
        res.json(new ApiResponse(200, null, 'Advertisement updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAdvertisementController = async (req, res, next) => {
    try {
        const advertisementId = req.params.id;
        const [rows] = await pool.query('SELECT * FROM advertisement WHERE id = ?', [advertisementId]);
        if (!rows.length) throw new CustomError(404, 'Advertisement not found');
        res.json(new ApiResponse(200, rows[0]));
    } catch (error) {
        next(error);
    }
};

export const deleteAdvertisementController = async (req, res, next) => {
    try {
        const advertisementId = req.params.id;
        await pool.query('DELETE FROM advertisement WHERE id = ?', [advertisementId]);
        res.json(new ApiResponse(200, null, 'Advertisement deleted successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const getAdvertisementActivityStatsController = async (req, res, next) => {
    try {
        const { advertisementId } = req.params;

        const [activityStats] = await pool.query(
            `SELECT 
                advertisement_id, 
                IFNULL(SUM(activity_type = 'view'), 0) AS total_views,
                IFNULL(SUM(activity_type = 'click'), 0) AS total_clicks
            FROM advertisement_activity
            WHERE advertisement_id = ?
            GROUP BY advertisement_id`,
            [advertisementId]
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
            [advertisementId]
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
