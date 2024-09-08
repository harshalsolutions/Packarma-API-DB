import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';

export const getMetaDetailsController = async (req, res, next) => {
    try {
        const [metaDetails] = await pool.query(`SELECT meta_title, meta_description, meta_keywords FROM CustomerGeneralSettings`);
        res.json(new ApiResponse(200, metaDetails[0], 'Meta details fetched successfully'));
    } catch (error) {
        next(error);
    }
}

export const updateMetaDetailsController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { meta_title, meta_description, meta_keywords } = req.body;
        const [metaDetails] = await connection.query(`UPDATE CustomerGeneralSettings SET meta_title = ?, meta_description = ?, meta_keywords = ?`, [meta_title, meta_description, meta_keywords]);
        await connection.commit();
        res.json(new ApiResponse(200, { metaDetails }, 'Meta details updated successfully'));
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
}