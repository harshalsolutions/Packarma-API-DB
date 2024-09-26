import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from "../../../utils/CustomError.js"
import { formatDateTime } from '../../../utils/dateFormatter.js';
import ExcelJS from 'exceljs';
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

export const exportAllReferralsController = async (req, res, next) => {
    try {
        const { from_date, to_date, name, signup_done, subscription_done, redeem_done } = req.body;

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

        query += ' ORDER BY r.createdAt DESC';

        const [referralsRows] = await pool.query(query, queryParams);

        if (!referralsRows.length) throw new CustomError(404, 'No subscriptions found');

        const csvData = referralsRows.map(referral => ({
            id: referral.id,
            referred_firstname: referral.referred_firstname,
            referred_lastname: referral.referred_lastname,
            referred_email: referral.referred_email,
            referrer_firstname: referral.referrer_firstname,
            referrer_lastname: referral.referrer_lastname,
            referrer_email: referral.referrer_email,
            account_created: referral.account_created,
            redeem_status: referral.redeem_status,
            subscription_completed: referral.subscription_completed,
            code: referral.code,
            createdAt: formatDateTime(referral.createdAt)
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('User Subscriptions');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Code', key: 'code', width: 30 },
            { header: 'Referred First Name', key: 'referred_firstname', width: 30 },
            { header: 'Referred Last Name', key: 'referred_lastname', width: 30 },
            { header: 'Referred Email', key: 'referred_email', width: 30 },
            { header: 'Referrer First Name', key: 'referrer_firstname', width: 30 },
            { header: 'Referrer Last Name', key: 'referrer_lastname', width: 30 },
            { header: 'Referrer Email', key: 'referrer_email', width: 30 },
            { header: 'Account Created', key: 'account_created', width: 20 },
            { header: 'Subscription Completed', key: 'subscription_completed', width: 30 },
            { header: 'Redeem Status', key: 'redeem_status', width: 30 },
            { header: 'Created At', key: 'createdAt', width: 20 }
        ];

        worksheet.addRows(csvData);

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment(`user_subscriptions_${new Date().toISOString()}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        next(error);
    }
};

