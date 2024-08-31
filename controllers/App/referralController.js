import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';
import { handleError } from "../../utils/ErrorHandler.js"

export const checkReferralCodeController = async (req, res, next) => {
    try {
        const { referralCode } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM referral_codes WHERE code = ?',
            [referralCode]
        );

        if (rows.length > 0) {
            res.status(200).json(new ApiResponse(200, { valid: true }, 'Referral code is valid'));
        } else {
            res.status(404).json(new ApiResponse(404, { valid: false }, 'Referral code is invalid'));
        }
    } catch (error) {
        console.log('checkReferralCodeController error:', error);
        handleError(error, next);
    }
};


export const updateReferralController = async (req, res, next) => {
    try {
        const { referralCode } = req.params;
        const { account_created, subscription_completed } = req.body;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [referralCodeRows] = await connection.query(
                'SELECT id FROM referral_codes WHERE code = ?',
                [referralCode]
            );

            if (referralCodeRows.length === 0) {
                return res.status(404).json(new ApiResponse(404, null, 'Referral code not found'));
            }
            const referralCodeId = referralCodeRows[0].id;
            const updates = [];
            const updateValues = [];
            if (typeof account_created !== 'undefined') {
                updates.push('account_created = ?');
                updateValues.push(account_created);
            }
            if (typeof subscription_completed !== 'undefined') {
                updates.push('subscription_completed = ?');
                updateValues.push(subscription_completed);
            }
            if (updates.length === 0) {
                return res.status(400).json(new ApiResponse(400, null, 'No valid fields provided for update'));
            }
            updateValues.push(referralCodeId);
            const updateQuery = `
                UPDATE referrals
                SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP
                WHERE referral_code_id = ?
            `;
            await connection.query(updateQuery, updateValues);
            await connection.commit();
            res.status(200).json(new ApiResponse(200, null, 'Referral status updated successfully'));
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.log('updateReferralController error:', error);
        handleError(error, next);
    }
};

export const getUsersByReferralCodeController = async (req, res, next) => {
    try {
        const { referralCode } = req.params;
        const query = `
            SELECT 
                u.firstname, u.lastname, u.email, r.account_created, r.subscription_completed
            FROM 
                referrals r
            JOIN 
                referral_codes rc ON r.referral_code_id = rc.id
            JOIN 
                users u ON r.referred_user_id = u.user_id
            WHERE 
                rc.code = ?;
        `;
        const [rows] = await pool.query(query, [referralCode]);
        if (rows.length === 0) {
            throw new CustomError(404, 'No users found for this referral code');
        }
        res.json(new ApiResponse(200, rows, 'Users and referral status fetched successfully'));
    } catch (error) {
        console.log('getUsersByReferralCodeController error:', error);
        next(error);
    }
};
