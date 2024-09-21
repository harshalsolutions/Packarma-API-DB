import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';
import ExcelJS from 'exceljs';
import CustomError from "../../../utils/CustomError.js"
export const getAllUsersController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const { name, phone_number, email, active_subscription, user_type } = filters;

        let query = `
            SELECT u.*, r.code, us.subscription_id, us.start_date, us.end_date, s.type AS subscription_name
            FROM users AS u
            LEFT JOIN referral_codes AS r ON u.referral_code_id = r.id
            LEFT JOIN user_subscriptions AS us ON u.user_id = us.user_id 
              AND (us.end_date > NOW() OR us.end_date IS NULL)
            LEFT JOIN subscriptions AS s ON us.subscription_id = s.id
            WHERE 1 = 1
        `;

        const queryParams = [];
        if (name) {
            query += ' AND (u.firstname LIKE ? OR u.lastname LIKE ?)';
            queryParams.push(`%${name}%`, `%${name}%`);
        }
        if (phone_number) {
            query += ' AND u.phone_number LIKE ?';
            queryParams.push(`%${phone_number}%`);
        }

        if (email) {
            query += ' AND u.email LIKE ?';
            queryParams.push(`%${email}%`);
        }

        if (active_subscription) {
            if (active_subscription === 'Active') {
                query += ' AND us.subscription_id IS NOT NULL AND us.end_date > CURDATE()';
            } else if (active_subscription === 'Inactive') {
                query += ' AND (us.subscription_id IS NULL OR us.end_date <= CURDATE())';
            }
        }

        if (user_type) {
            if (user_type === 'Normal') {
                query += ' AND u.user_id NOT IN (SELECT referred_user_id FROM referrals WHERE account_created = 1)';
            } else if (user_type === 'Referred') {
                query += ' AND u.referral_code_id IN (SELECT id FROM referral_codes WHERE user_id IN (SELECT referred_user_id FROM referrals WHERE account_created = 1))';
            }
        }

        query += ' ORDER BY u.user_id DESC LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), (Number(page) - 1) * Number(limit));

        const [users] = await pool.query(query, queryParams);

        let countQuery = `
            SELECT COUNT(*) as totalCount
            FROM users AS u
            LEFT JOIN user_subscriptions AS us ON u.user_id = us.user_id 
              AND (us.end_date > NOW() OR us.end_date IS NULL)
            WHERE 1 = 1
        `;
        const countParams = [];

        if (name) {
            countQuery += ' AND (u.firstname LIKE ? OR u.lastname LIKE ?)';
            countParams.push(`%${name}%`, `%${name}%`);
        }
        if (phone_number) {
            countQuery += ' AND u.phone_number LIKE ?';
            countParams.push(`%${phone_number}%`);
        }

        if (email) {
            countQuery += ' AND u.email LIKE ?';
            countParams.push(`%${email}%`);
        }

        if (active_subscription) {
            if (active_subscription === 'active') {
                countQuery += ' AND us.subscription_id IS NOT NULL AND us.end_date > CURDATE()';
            } else if (active_subscription === 'inactive') {
                countQuery += ' AND (us.subscription_id IS NULL OR us.end_date <= CURDATE())';
            }
        }

        if (user_type) {
            if (user_type === 'normal') {
                countQuery += ' AND u.user_id NOT IN (SELECT referred_user_id FROM referrals WHERE account_created = 1)';
            } else if (user_type === 'referred') {
                countQuery += ' AND u.referral_code_id IN (SELECT id FROM referral_codes WHERE user_id IN (SELECT referred_user_id FROM referrals WHERE account_created = 1))';
            }
        }

        const [[{ totalCount }]] = await pool.query(countQuery, countParams);

        const totalPages = Math.ceil(totalCount / Number(limit));

        if (!users.length) {
            return res.json(new ApiResponse(200, {
                users: [],
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: Number(limit)
                }
            }, 'No users found'));
        }

        users.forEach(user => {
            delete user.password;
        });

        res.json(new ApiResponse(200, {
            users: users,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        console.log(error);
        next(new CustomError(500, error.message));
    }
};

export const getUserWithAddressController = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ? ', [user_id, limit, (page - 1) * limit]);
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM addresses WHERE user_id = ?`, [user_id]);
        const totalPages = Math.ceil(totalCount / limit);

        if (!addresses.length) {
            return res.json(new ApiResponse(200, { addresses: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: limit } }, 'No addresses found'));
        }
        delete addresses.password;
        res.json(new ApiResponse(200, {
            addresses: addresses,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: totalCount,
                itemsPerPage: Number(limit)
            }
        }));
    } catch (error) {
        console.log(error)
        next(new CustomError(500, error.message));
    }
}

export const getAllUserAddressesController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const [addresses] = await pool.query('SELECT a.*, u.firstname, u.lastname, u.email FROM addresses as a JOIN users as u ON a.user_id = u.user_id ORDER BY a.created_at DESC LIMIT ? OFFSET ?', [Number(limit), (page - 1) * Number(limit)]);
        const [[{ totalCount }]] = await pool.query(`SELECT COUNT(*) as totalCount FROM addresses`);

        const totalPages = Math.ceil(totalCount / Number(limit));

        if (!addresses.length) {
            return res.json(new ApiResponse(200, { addresses: [], pagination: { currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: Number(limit) } }, 'No addresses found'));
        }
        res.json(new ApiResponse(200, {
            addresses: addresses,
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

export const AddCreditController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { user_id } = req.params;
        const { credits, description } = req.body;
        const [user] = await connection.query('UPDATE users SET credits = credits + ? WHERE user_id = ?', [credits, user_id]);
        await connection.query('INSERT INTO credit_history (user_id, change_amount, description) VALUES (?, ?, ?)', [user_id, credits, "Credit added by admin"]);
        await connection.query('INSERT INTO credit_given_history (description, credits, adminId, user_id) VALUES (?, ?, ?, ?)', [description, credits, req.user.adminId, user_id]);
        if (!user.affectedRows) {
            await connection.rollback();
            return res.json(new ApiResponse(404, {}, 'User not found'));
        }
        await connection.commit();
        res.json(new ApiResponse(200, user, 'Credit added successfully by admin'));
    } catch (error) {
        await connection.rollback();
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
}


export const exportUsersDataController = async (req, res, next) => {
    try {
        const { link } = req.body;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users Data');

        const [users] = await pool.query(`
            SELECT u.*, r.code, us.subscription_id, us.start_date, us.end_date, s.type AS subscription_name
            FROM users AS u
            LEFT JOIN referral_codes AS r ON u.referral_code_id = r.id
            LEFT JOIN user_subscriptions AS us ON u.user_id = us.user_id 
              AND (us.end_date > NOW() OR us.end_date IS NULL)
            LEFT JOIN subscriptions AS s ON us.subscription_id = s.id
            ORDER BY u.user_id;
        `, []);

        const csvData = users.map(user => ({
            user_id: user.user_id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            referral_code: user.code,
            credits: user.credits,
            active_subscription: user.subscription_id !== null ? 'Yes' : 'No',
            subscription_id: user.subscription_id,
            subscription_name: user.subscription_name,
            start_date: user.start_date,
            end_date: user.end_date,
            email_verified: user.email_verified ? 'Yes' : 'No',
            email_verified_at: user.email_verified_at,
            gst_number: user.gst_number,
            gst_document_link: user.gst_document_link ? (link ? link : "") + user.gst_document_link : null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));

        worksheet.addRow([
            'User ID',
            'Firstname',
            'Lastname',
            'Email',
            'Referral Code',
            'Credits',
            'Active Subscription',
            'Subscription ID',
            'Subscription Name',
            'Subscription Start Date',
            'Subscription End Date',
            'Email Verified',
            'Email Verified At',
            'GST Number',
            'GST Document Link',
            'Created At',
            'Updated At',
        ], { header: true });

        worksheet.columns = [
            { key: 'user_id', width: 15 },
            { key: 'firstname', width: 15 },
            { key: 'lastname', width: 15 },
            { key: 'email', width: 30 },
            { key: 'referral_code', width: 30 },
            { key: 'credits', width: 15 },
            { key: 'active_subscription', width: 20 },
            { key: 'subscription_id', width: 20 },
            { key: 'subscription_name', width: 30 },
            { key: 'start_date', width: 20, style: { numFmt: 'dd/mm/yyyy' } },
            { key: 'end_date', width: 20, style: { numFmt: 'dd/mm/yyyy' } },
            { key: 'email_verified', width: 15 },
            { key: 'email_verified_at', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
            { key: 'gst_number', width: 30 },
            { key: 'gst_document_link', width: 30 },
            { key: 'createdAt', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
            { key: 'updatedAt', width: 20, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
        ];

        worksheet.addRows(csvData);

        res.setHeader('Content-Disposition', 'attachment; filename="users_data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};



