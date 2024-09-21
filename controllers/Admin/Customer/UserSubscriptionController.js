import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from "../../../utils/CustomError.js"

export const getAllUserSubscriptionsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM user_subscriptions`);
        const totalPages = Math.ceil(totalCount / limit);

        const [subscriptions] = await pool.query(`
            SELECT us.id, us.user_id, us.subscription_id, us.start_date, us.end_date, s.type AS subscription_name, si.total_price, si.currency, si.invoice_link, si.invoice_date, si.transaction_id, si.createdAt, si.updatedAt, u.firstname, u.lastname, u.email
            FROM user_subscriptions AS us
            JOIN subscription_invoice AS si ON us.subscription_id = si.subscription_id
            JOIN subscriptions AS s ON us.subscription_id = s.id
            JOIN users AS u ON us.user_id = u.user_id
            ORDER BY si.createdAt DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), offset]);

        if (!subscriptions.length) {
            return res.json(new ApiResponse(200, { subscriptions: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No referrals found'));
        }

        res.json(new ApiResponse(200, {
            subscriptions: subscriptions,
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
