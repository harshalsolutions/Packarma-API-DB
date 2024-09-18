import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import CustomError from "../../../utils/CustomError.js"


export const getAllRedeemReferralRequestController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, redeem_status } = req.query;

        let query = `
            SELECT r.id, r.referral_id, r.description, r.redeem_status, r.redeem_requested_at, r.createdAt, r.updatedAt, 
            rc.code as referral_code, u.firstname as referred_firstname, u.lastname as referred_lastname, u.email as referred_email, 
            u2.firstname as referrer_firstname, u2.lastname as referrer_lastname, u2.email as referrer_email
            FROM redeem_requests r
            JOIN referrals ref ON r.referral_id = ref.id
            JOIN referral_codes rc ON ref.referral_code_id = rc.id
            JOIN users u ON ref.referred_user_id = u.user_id
            JOIN users u2 ON rc.user_id = u2.user_id
            WHERE 1 = 1
        `;

        let countQuery = `SELECT COUNT(*) as totalCount FROM redeem_requests r WHERE 1 = 1`;

        const queryParams = [];
        const countParams = [];

        if (redeem_status === 'Completed' || redeem_status === 'Incompleted') {
            query += ' AND r.redeem_status = ?';
            countQuery += ' AND r.redeem_status = ?';
            const isCompleted = redeem_status === 'Completed';
            queryParams.push(isCompleted);
            countParams.push(isCompleted);
        }

        query += ' ORDER BY r.redeem_requested_at DESC LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), (Number(page) - 1) * Number(limit));

        const [redeemRequest] = await pool.query(query, queryParams);
        const [[{ totalCount }]] = await pool.query(countQuery, countParams);

        const totalPages = Math.ceil(totalCount / limit);

        if (!redeemRequest.length) {
            return res.json(new ApiResponse(200, {
                redeemRequest: [],
                pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit }
            }, 'No referrals found'));
        }

        res.json(new ApiResponse(200, {
            redeemRequest,
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




export const updateRedeemStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { redeem_status, description } = req.body;

        if (redeem_status === undefined || typeof redeem_status !== 'boolean') {
            return res.status(400).json(new ApiResponse(400, null, 'Invalid redeem status provided'));
        }

        if (description && description.length > 255) {
            return res.status(400).json(new ApiResponse(400, null, 'Description is too long. Maximum 255 characters allowed.'));
        }

        const [result] = await pool.query(`
            UPDATE redeem_requests
            SET redeem_status = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [redeem_status, description || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json(new ApiResponse(404, null, 'Redeem request not found'));
        }

        if (redeem_status) {
            await pool.query(`
                UPDATE referrals
                SET redeem_status = ?, updatedAt = CURRENT_TIMESTAMP
                WHERE id = (SELECT referral_id FROM redeem_requests WHERE id = ?)
            `, [true, id]);
        }

        res.json(new ApiResponse(200, null, 'Redeem status and description updated successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};
