import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';

export const logBannerActivityController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { bannerId, activityType } = req.body;

        if (!['view', 'click'].includes(activityType)) {
            throw new CustomError(400, 'Invalid activity type');
        }

        await pool.query(
            'INSERT INTO banner_activity (user_id, banner_id, activity_type) VALUES (?, ?, ?)',
            [userId, bannerId, activityType]
        );

        res.status(201).json(new ApiResponse(201, null, 'Banner activity logged successfully'));
    } catch (error) {
        console.log('logBannerActivityController error:', error);
        next(new CustomError(500, error.message));
    }
};

