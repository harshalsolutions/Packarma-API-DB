import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from "../../utils/CustomError.js";

export const getTotalUserCount = async (req, res, next) => {
    try {
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM users`);
        res.json(new ApiResponse(200, { totalCount }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getTotalFreeSubscriptionCount = async (req, res, next) => {
    try {
        const [[{ totalCount }]] = await pool.query(`
            SELECT COUNT(*) as totalCount FROM user_subscriptions WHERE subscription_id = 1
        `);
        res.json(new ApiResponse(200, { totalCount }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getTotalPaidSubscriptionCount = async (req, res, next) => {
    try {
        const [[{ totalCount }]] = await pool.query(`
            SELECT COUNT(*) as totalCount FROM user_subscriptions WHERE subscription_id IS NOT NULL AND subscription_id != 1
        `);
        res.json(new ApiResponse(200, { totalCount }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getTotalActiveSubscriptionCount = async (req, res, next) => {
    try {
        const [[{ totalCount }]] = await pool.query(`
            SELECT COUNT(DISTINCT user_id) as totalCount 
            FROM user_subscriptions 
            WHERE subscription_id != 1 AND end_date >= CURDATE()
        `);
        res.json(new ApiResponse(200, { totalCount }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};


export const getTotalEnquiriesCount = async (req, res, next) => {
    try {
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM search_history`);
        res.json(new ApiResponse(200, { totalCount }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getTotalSignupsFromReferrals = async (req, res, next) => {
    try {
        const [[{ totalCount }]] = await pool.query(`
            SELECT COUNT(*) as totalCount 
            FROM users u 
            JOIN referrals r ON u.referral_code_id = r.referral_code_id 
            WHERE u.referral_code_id IS NOT NULL
        `);
        res.json(new ApiResponse(200, { totalCount }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getTotalSubscriptionsFromReferralSignups = async (req, res, next) => {
    try {
        const [[{ totalCount }]] = await pool.query(`
            SELECT COUNT(us.id) as totalCount 
            FROM user_subscriptions us 
            JOIN users u ON us.user_id = u.user_id 
            JOIN referrals r ON u.referral_code_id = r.referral_code_id 
            WHERE u.referral_code_id IS NOT NULL
        `);
        res.json(new ApiResponse(200, { totalCount }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getUserComparison = async (req, res, next) => {
    try {
        const [[{ totalUser }]] = await pool.query(`
            SELECT COUNT(*) as totalUser FROM users
        `);

        const [[{ referredUsers }]] = await pool.query(`
            SELECT COUNT(*) as referredUsers FROM users WHERE referral_code_id IN (
                SELECT id FROM referral_codes WHERE user_id IN (
                    SELECT referred_user_id FROM referrals WHERE account_created = 1
                )
            )
        `);

        res.json(new ApiResponse(200, { referredUsers, normalUsers: totalUser - referredUsers }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getReferralTaskCompletion = async (req, res, next) => {
    try {
        const [[{ accountsCreated }]] = await pool.query(`
            SELECT COUNT(*) as accountsCreated FROM referrals WHERE account_created = 1
        `);

        const [[{ subscriptionsBought }]] = await pool.query(`
            SELECT COUNT(*) as subscriptionsBought FROM referrals WHERE subscription_completed = 1

        `);

        res.json(new ApiResponse(200, { accountsCreated, subscriptionsBought }));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};