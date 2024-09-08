import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';

export const getSystemDetailsController = async (req, res, next) => {
    try {
        const [systemDetails] = await pool.query(`SELECT system_phone_number, system_email FROM CustomerGeneralSettings`);
        res.json(new ApiResponse(200, systemDetails[0], 'System details fetched successfully'));
    } catch (error) {
        next(error);
    }
}

export const updateSystemDetailsController = async (req, res, next) => {
    try {
        const { system_phone_number, system_email } = req.body;
        const [systemDetails] = await pool.query(`UPDATE CustomerGeneralSettings SET system_phone_number = ?, system_email = ?`, [system_phone_number, system_email]);
        res.json(new ApiResponse(200, { systemDetails }, 'System details updated successfully'));
    } catch (error) {
        next(error);
    }
}