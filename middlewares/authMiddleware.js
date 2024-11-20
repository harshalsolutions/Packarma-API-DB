import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ApiResponse from "../utils/ApiResponse.js";
import pool from "../config/database.js";
dotenv.config();

export default async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Authorization Denied!"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId) {
      const [userResult] = await pool.query(
        "SELECT * FROM users WHERE user_id = ? AND email = ?",
        [decoded.userId, decoded.email],
      );
      if (userResult.length === 0) {
        return res
          .status(401)
          .json(new ApiResponse(401, null, "Authorization Denied!"));
      }
      req.user = decoded;
    } else {
      req.user = decoded;
    }
    next();
  } catch (err) {
    res.status(401).json(new ApiResponse(401, null, "Authorization Denied!"));
  }
};
