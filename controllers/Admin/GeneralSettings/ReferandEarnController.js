import ApiResponse from '../../../utils/ApiResponse.js';
import pool from '../../../config/database.js';

export const getAllBenefitsController = async (req, res, next) => {
    try {
        const [benefits] = await pool.query(`SELECT * FROM refer_earn_benefits`);
        res.json(new ApiResponse(200, benefits, 'Benefits fetched successfully'));
    } catch (error) {
        next(error);
    }
};

export const createBenefitController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { benefit_text } = req.body;

        await connection.beginTransaction();
        const [result] = await connection.query(
            `INSERT INTO refer_earn_benefits (benefit_text) VALUES (?)`,
            [benefit_text]
        );
        await connection.commit();

        res.json(new ApiResponse(201, { benefit_id: result.insertId, benefit_text }, 'Benefit created successfully'));
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

export const deleteBenefitController = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { benefit_id } = req.params;

        await connection.beginTransaction();
        await connection.query(`DELETE FROM refer_earn_benefits WHERE benefit_id = ?`, [benefit_id]);
        await connection.commit();

        res.json(new ApiResponse(200, { benefit_id }, 'Benefit deleted successfully'));
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};
