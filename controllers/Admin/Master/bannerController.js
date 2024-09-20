import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from '../../../utils/CustomError.js';
import { unlink } from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

export const getAllBannerController = async (req, res, next) => {
    try {
        const { status, search } = req.query;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
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

        if (search) {
            query += status ? ' AND' : ' WHERE';
            query += ' b.title LIKE ?';
            queryParams.push(`%${search}%`);
        }

        query += ' GROUP BY b.id ORDER BY b.sequence';
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), Number(offset));

        const [rows] = await pool.query(query, queryParams);

        if (!rows.length) {
            return res.json(new ApiResponse(200, null, 'No banners found'));
        }
        const [totalCount] = await pool.query('SELECT COUNT(*) as count FROM banner');

        const total = totalCount[0].count;
        const totalPages = Math.ceil(total / limit);
        const pagination = {
            currentPage: Number(page),
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: Number(limit)
        };

        res.json(new ApiResponse(200, {
            banners: rows,
            pagination
        }));

    } catch (error) {
        next(error);
    }
};

export const exportBannerControllerById = async (req, res, next) => {
    try {
        const bannerId = req.params.id;
        const { link } = req.body
        const [bannerRows] = await pool.query(`
            SELECT 
                b.title,
                b.description,
                b.createdAt,
                b.updatedAt,
                b.banner_image,
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
        `, [bannerId, bannerId]);

        if (!bannerRows.length) throw new CustomError(404, 'Banner not found');

        const banner = bannerRows[0];

        const [userActivity] = await pool.query(`
            SELECT 
                u.user_id,
                u.firstname,
                u.lastname,
                u.email,
                ba.activity_type,
                ba.activity_timestamp
            FROM 
                banner_activity ba
            JOIN 
                users u ON ba.user_id = u.user_id
            WHERE 
                ba.banner_id = ?
        `, [bannerId]);

        console.log(banner)

        const csvData = userActivity.map(activity => ({
            title: banner.title,
            description: banner.description,
            createdAt: banner.createdAt,
            updatedAt: banner.updatedAt,
            user_id: activity.user_id,
            firstname: activity.firstname,
            lastname: activity.lastname,
            email: activity.email,
            activity_type: activity.activity_type,
            activity_timestamp: activity.activity_timestamp,
            total_views: banner.total_views,
            total_clicks: banner.total_clicks,
            image: (link ? link : "") + banner.banner_image
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Banner Clicks and Views');

        worksheet.columns = [
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 30 },
            { header: 'Image', key: 'image', width: 30 },
            { header: 'Total Views', key: 'total_views', width: 15 },
            { header: 'Total Clicks', key: 'total_clicks', width: 15 },
            {
                header: 'Created At', key: 'createdAt', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' }
            },
            {
                header: 'Updated At', key: 'updatedAt', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' }
            },
            { header: 'User ID', key: 'user_id', width: 15 },
            { header: 'First Name', key: 'firstname', width: 15 },
            { header: 'Last Name', key: 'lastname', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Activity Type', key: 'activity_type', width: 30 },
            { header: 'Activity Timestamp', key: 'activity_timestamp', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } }
        ];

        worksheet.addRows(csvData);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`banner_${bannerId}_${new Date()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
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

        const [[{ totalCount }]] = await pool.query('SELECT COUNT(*) as totalCount FROM banner');

        const query = 'INSERT INTO banner (title, description, start_date_time, end_date_time, link, app_page, banner_image, sequence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [title, description, start_date_time, end_date_time, link, app_page, banner_image, totalCount + 1]);

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
                const absolutePath = path.join(process.cwd(), oldFilePath);
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
            const absolutePath = path.join(process.cwd(), oldFilePath)
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