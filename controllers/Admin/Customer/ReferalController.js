import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from "../../../utils/CustomError.js"

export const getAllReferralsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const [referrals] = await pool.query(`
            SELECT r.*, rc.code, u.firstname as referred_firstname, u.lastname as referred_lastname, u.email as referred_email, u2.firstname as referrer_firstname, u2.lastname as referrer_lastname, u2.email as referrer_email
            FROM referrals AS r 
            JOIN referral_codes AS rc ON r.referral_code_id = rc.id 
            JOIN users AS u ON r.referred_user_id = u.user_id
            JOIN users AS u2 ON rc.user_id = u2.user_id
            ORDER BY r.createdAt DESC
            LIMIT ? OFFSET ?
        `, [Number(limit), (Number(page) - 1) * Number(limit)]);
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM referrals`);

        const totalPages = Math.ceil(totalCount / limit);

        if (!referrals.length) {
            return res.json(new ApiResponse(200, { referrals: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No referrals found'));
        }
        res.json(new ApiResponse(200, {
            referrals: referrals,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
