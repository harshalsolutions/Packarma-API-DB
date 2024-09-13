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
