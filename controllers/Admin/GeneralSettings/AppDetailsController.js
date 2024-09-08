import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';

export const getAppDetailsController = async (req, res, next) => {
    try {
        const [appDetails] = await pool.query(`SELECT app_version_android, app_version_ios, app_link_android, app_link_ios FROM CustomerGeneralSettings`);
        res.json(new ApiResponse(200, appDetails[0], 'App details fetched successfully'));
    } catch (error) {
        next(error);
    }
}

export const updateAppDetailsController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { app_version_android, app_version_ios, app_link_android, app_link_ios } = req.body;
        const [appDetails] = await connection.query(
            `UPDATE CustomerGeneralSettings 
             SET app_version_android = ?, app_version_ios = ?, app_link_android = ?, app_link_ios = ?`,
            [app_version_android, app_version_ios, app_link_android, app_link_ios]
        );
        await connection.commit();
        res.json(new ApiResponse(200, { appDetails }, 'App details updated successfully'));
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
}