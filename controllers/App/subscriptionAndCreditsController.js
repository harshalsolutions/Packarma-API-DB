import ApiResponse from "../../utils/ApiResponse.js";
import pool from "../../config/database.js";
import CustomError from "../../utils/CustomError.js";
import { handleError } from "../../utils/ErrorHandler.js";

export const modifyCredits = async (req, res, next) => {
  const { credits, description } = req.body;
  const userId = req.user.userId;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [rows] = await connection.query(
        "SELECT credits FROM users WHERE user_id = ?",
        [userId],
      );
      if (!rows.length) throw new CustomError(404, "User not found");

      const currentCredits = rows[0].credits;
      const newCredits = currentCredits + credits;

      await connection.query(
        "UPDATE users SET credits = ?, updatedAt = CURRENT_TIMESTAMP WHERE user_id = ?",
        [newCredits, userId],
      );

      await connection.query(
        "INSERT INTO credit_history (user_id, change_amount, description) VALUES (?, ?, ?)",
        [
          userId,
          credits,
          description || (credits > 0 ? "Credit added" : "Credit deducted"),
        ],
      );

      await connection.commit();
      res.json(
        new ApiResponse(
          200,
          { credits: newCredits },
          "Credits updated successfully",
        ),
      );
    } catch (error) {
      await connection.rollback();
      handleError(error, next);
    } finally {
      connection.release();
    }
  } catch (error) {
    handleError(error, next);
  }
};

export const getCreditHistory = async (req, res, next) => {
  const userId = req.user.userId;

  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM credit_history WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
      );
      if (rows.length === 0) {
        return res.json(
          new ApiResponse(404, null, "No credit history found for this user"),
        );
      }
      res.json(
        new ApiResponse(200, rows, "Credit history retrieved successfully"),
      );
    } catch (error) {
      handleError(error, next);
    } finally {
      connection.release();
    }
  } catch (error) {
    handleError(error, next);
  }
};
export const getSubscriptionsController = async (req, res, next) => {
  try {
    const subscriptionsQuery = `
      SELECT id, type, credit_amount, duration, benefits, sequence, 
             deleted_at, createdAt, updatedAt
      FROM subscriptions
      ORDER BY sequence;
    `;

    const [subscriptions] = await pool.query(subscriptionsQuery);

    if (!subscriptions.length) {
      throw new CustomError(404, "No subscriptions found");
    }

    const pricesQuery = `
      SELECT subscription_id, price, currency, status
      FROM subscriptions_prices
      WHERE subscription_id IN (?) AND status = 'active'
    `;

    const subscriptionIds = subscriptions.map((sub) => sub.id);
    const [prices] = await pool.query(pricesQuery, [subscriptionIds]);

    const processedSubscriptions = subscriptions.map((subscription) => {
      const subscriptionPrices = prices
        .filter((price) => price.subscription_id === subscription.id)
        .map((price) => ({
          price: price.price,
          currency: price.currency,
          status: price.status,
        }));

      return {
        ...subscription,
        prices: subscriptionPrices,
        benefits: subscription.benefits ? subscription.benefits.split("#") : [],
      };
    });

    res.json(
      new ApiResponse(
        200,
        processedSubscriptions,
        "Subscriptions fetched successfully",
      ),
    );
  } catch (error) {
    next(new CustomError(500, error.message));
  }
};

export const addFreeTrailController = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.userId;

    const [subscriptionData] = await connection.query(
      `SELECT * FROM subscriptions WHERE id = ?`,
      [1],
    );
    if (subscriptionData.length === 0) {
      throw new Error("Subscription not found");
    }

    const { duration } = subscriptionData[0];

    const [existingSubscriptions] = await connection.query(
      "SELECT end_date FROM user_subscriptions WHERE user_id = ? ORDER BY end_date DESC LIMIT 1",
      [userId],
    );

    let startDate = new Date();
    if (existingSubscriptions.length > 0) {
      const lastEndDate = new Date(existingSubscriptions[0].end_date);
      if (lastEndDate > startDate) {
        startDate = new Date(lastEndDate);
        startDate.setDate(startDate.getDate() + 1);
      }
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);

    await connection.query(
      `INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date) VALUES (?, ?, ?, ?)`,
      [userId, 1, startDate, endDate],
    );

    await connection.commit();

    res.json(new ApiResponse(200, null, "Free trial added successfully"));
  } catch (error) {
    await connection.rollback();
    next(new CustomError(500, error.message));
  } finally {
    connection.release();
  }
};
