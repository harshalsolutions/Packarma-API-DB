import fs from 'fs';
import path from 'path';
import ApiResponse from '../../utils/ApiResponse.js';
import { handleError } from "../../utils/ErrorHandler.js";

const termsFilePath = path.join(process.cwd(), 'public', 'terms-and-conditions.html');
const privacyFilePath = path.join(process.cwd(), 'public', 'privacy-policy.html');

export const getTermsAndConditionsController = async (req, res, next) => {
    try {
        const termsData = fs.readFileSync(termsFilePath, 'utf-8');
        res.json(new ApiResponse(200, termsData, "Retrieved terms and conditions successfully"));
    } catch (error) {
        handleError(error, next);
    }
};

export const getPrivacyPolicyController = async (req, res, next) => {
    try {
        const privacyData = fs.readFileSync(privacyFilePath, 'utf-8');
        res.json(new ApiResponse(200, privacyData, "Retrieved privacy policy successfully"));
    } catch (error) {
        handleError(error, next);
    }
};

export const updateTermsAndConditionsController = async (req, res, next) => {
    try {
        const { content } = req.body;
        fs.writeFileSync(termsFilePath, content, 'utf-8');
        res.json(new ApiResponse(200, null, 'Terms and Conditions updated successfully'));
    } catch (error) {
        handleError(error, next);
    }
};

export const updatePrivacyPolicyController = async (req, res, next) => {
    try {
        const { content } = req.body;
        fs.writeFileSync(privacyFilePath, content, 'utf-8');
        res.json(new ApiResponse(200, null, 'Privacy Policy updated successfully'));
    } catch (error) {
        handleError(error, next);
    }
};
