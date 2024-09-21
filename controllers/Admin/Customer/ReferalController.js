import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from "../../../utils/CustomError.js"

export const getAllReferralsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, from_date, to_date, name, signup_done, subscription_done, redeem_done } = req.query;

        let query = `
            SELECT r.*, rc.code, u.firstname as referred_firstname, u.lastname as referred_lastname, u.email as referred_email, u2.firstname as referrer_firstname, u2.lastname as referrer_lastname, u2.email as referrer_email
            FROM referrals AS r 
            JOIN referral_codes AS rc ON r.referral_code_id = rc.id 
            JOIN users AS u ON r.referred_user_id = u.user_id
            JOIN users AS u2 ON rc.user_id = u2.user_id
        `;

        const queryParams = [];
        const conditions = [];

        if (from_date && to_date) {
            conditions.push('r.createdAt BETWEEN ? AND ?');
            queryParams.push(new Date(from_date + ' 00:00:00').toISOString(), new Date(to_date + ' 23:59:59').toISOString());
        }

        if (name) {
            conditions.push('(u.firstname LIKE ? OR u.lastname LIKE ? OR u.email LIKE ?)');
            queryParams.push(`%${name}%`, `%${name}%`, `%${name}%`);
        }

        if (signup_done === 'Completed') {
            conditions.push('r.account_created = 1');
        } else if (signup_done === 'Incompleted') {
            conditions.push('r.account_created = 0');
        }

        if (subscription_done === 'Completed') {
            conditions.push('r.subscription_completed = 1');
        } else if (subscription_done === 'Incompleted') {
            conditions.push('r.subscription_completed = 0');
        }

        if (redeem_done === 'Completed') {
            conditions.push('r.redeem_status = 1');
        } else if (redeem_done === 'Incompleted') {
            conditions.push('r.redeem_status = 0');
        }

        if (conditions.length) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        const countQuery = 'SELECT COUNT(*) as totalCount FROM (' + query + ') as countTable';
        const [[{ totalCount }]] = await pool.query(countQuery, queryParams);

        query += ' ORDER BY r.createdAt DESC LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), (Number(page) - 1) * Number(limit));

        const [referrals] = await pool.query(query, queryParams);

        const totalPages = Math.ceil(totalCount / limit);

        res.json(new ApiResponse(200, {
            referrals: referrals,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }, referrals.length ? 'Referrals retrieved successfully' : 'No referrals found'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

