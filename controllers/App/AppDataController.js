import ApiResponse from '../../utils/ApiResponse.js';
import pool from '../../config/database.js';
import CustomError from '../../utils/CustomError.js';
import fs from 'fs';
import path from 'path';

export const getTermsAndConditionController = async (req, res, next) => {
    try {
        const filePath = path.join(process.cwd(), 'utils/data/terms_and_conditions.html');
        const data = await fs.promises.readFile(filePath, 'utf8');

        res.json(new ApiResponse(200, data, 'Terms and Conditions fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getPrivacyPolicyController = async (req, res, next) => {
    try {
        const filePath = path.join(process.cwd(), 'utils/data/privacy_policy.html');
        const data = await fs.promises.readFile(filePath, 'utf8');

        res.json(new ApiResponse(200, data, 'Privacy Policy fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getAboutUsController = async (req, res, next) => {
    try {
        const filePath = path.join(process.cwd(), 'utils/data/about_us.html');
        const data = await fs.promises.readFile(filePath, 'utf8');

        res.json(new ApiResponse(200, data, 'About Us fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getReferAndEarnTAndCController = async (req, res, next) => {
    try {
        const filePath = path.join(process.cwd(), 'utils/data/refer_earn_tac.html');
        const data = await fs.promises.readFile(filePath, 'utf8');

        res.json(new ApiResponse(200, data, 'Refer and Earn T&C fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    }
};

export const getReferAndEarnBenefitsController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { status } = req.query;

        const selectQuery = `
            SELECT * from refer_earn_benefits ORDER BY createdAt DESC;
        `;

        let queryParams = [status];

        const [rows] = await connection.query(selectQuery, queryParams);

        if (!rows.length) {
            return res.status(404).json(new ApiResponse(404, [], 'No Benefits Found'));
        }

        res.json(new ApiResponse(200, rows, 'Benefits fetched successfully'));
    } catch (error) {
        next(new CustomError(500, error.message));
    } finally {
        connection.release();
    }
};
