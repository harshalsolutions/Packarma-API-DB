import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import ApiResponse from '../utils/ApiResponse.js';

dotenv.config();

export default (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json(new ApiResponse(401, null, 'Authorization Denied!'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json(new ApiResponse(401, null, 'Authorization Denied!'));
    }
};
