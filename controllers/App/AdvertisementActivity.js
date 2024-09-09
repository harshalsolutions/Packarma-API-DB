import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';

export const logAdvertisementActivityController = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { advertisementId, activityType } = req.body;

        if (!['view', 'click'].includes(activityType)) {
            throw new CustomError(400, 'Invalid activity type');
        }

        await pool.query(
            'INSERT INTO advertisement_activity (user_id, advertisement_id, activity_type) VALUES (?, ?, ?)',
            [userId, advertisementId, activityType]
        );

        res.status(201).json(new ApiResponse(201, null, 'Advertisement activity logged successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

