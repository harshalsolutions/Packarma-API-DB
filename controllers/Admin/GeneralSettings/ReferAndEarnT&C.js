import ApiResponse from '../../../utils/ApiResponse.js';
import path from 'path';
import fs from 'fs';

export const getReferAndEarnTAndCController = async (req, res, next) => {
    try {
        const htmlPath = path.join(process.cwd(), 'utils/data/refer_earn_tac.html');
        const htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
        res.json(new ApiResponse(200, htmlTemplate, 'Privacy policy fetched successfully'));
    } catch (error) {
        next(error);
    }
}

export const updateReferAndEarnTAndCController = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.json(new ApiResponse(400, null, 'No data provided'));
        }
        const filePath = path.join(process.cwd(), 'utils/data/refer_earn_tac.html');
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