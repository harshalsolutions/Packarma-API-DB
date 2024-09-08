import ApiResponse from '../../../utils/ApiResponse.js';
import path from 'path';
import fs from 'fs';

export const getTermsAndConditionsController = async (req, res, next) => {
    try {
        const htmlPath = path.join(process.cwd(), 'utils/data/terms_and_conditions.html');
        const htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
        res.json(new ApiResponse(200, htmlTemplate, 'Terms and conditions fetched successfully'));
    } catch (error) {
        next(error);
    }
}

export const updateTermsAndConditionsController = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.json(new ApiResponse(400, null, 'No data provided'));
        }
        const filePath = path.join(process.cwd(), 'utils/data/terms_and_conditions.html');
        fs.writeFile(filePath, text, (err) => {
            if (err) {
                return res.json(new ApiResponse(500, null, 'Error writing file'));
            }
            res.json(new ApiResponse(200, null, 'File saved successfully'));
        });
    } catch (error) {
        next(error);
    }
}