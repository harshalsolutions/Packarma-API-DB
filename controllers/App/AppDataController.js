import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';

export const getGeneralSettingsController = async (req, res, next) => {
    try {
        const query = `
            SELECT terms_and_conditions, privacy_policy
            FROM CustomerGeneralSettings
            LIMIT 1;
        `;

        const [rows] = await pool.query(query);

        if (rows.length === 0) {
            throw new CustomError(200, 'No data found');
        }

        res.json(new ApiResponse(200, {
            terms_and_conditions: rows[0].terms_and_conditions,
            privacy_policy: rows[0].privacy_policy
        }, 'Settings fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
