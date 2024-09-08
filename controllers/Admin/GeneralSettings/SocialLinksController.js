import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';

export const getSocialLinksController = async (req, res, next) => {
    try {
        const [socialLinks] = await pool.query(`SELECT instagram_link, facebook_link, twitter_link, youtube_link FROM CustomerGeneralSettings`);
        res.json(new ApiResponse(200, socialLinks[0], 'Social links fetched successfully'));
    } catch (error) {
        next(error);
    }
}

export const updateSocialLinksController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { instagram_link, facebook_link, twitter_link, youtube_link } = req.body;

        await connection.beginTransaction();

        const [socialLinks] = await connection.query(
            `UPDATE CustomerGeneralSettings SET instagram_link = ?, facebook_link = ?, twitter_link = ? , youtube_link = ?`,
            [instagram_link, facebook_link, twitter_link, youtube_link]
        );

        await connection.commit();

        res.json(new ApiResponse(200, { socialLinks }, 'Social links updated successfully'));
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
}