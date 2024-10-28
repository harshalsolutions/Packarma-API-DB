import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import ExcelJS from "exceljs";
import { formatDateTime } from "../../../utils/dateFormatter.js";

export const getAllUserSubscriptionsController = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const {
      page = 1,
      limit = 10,
      name,
      start_date,
      end_date,
      subscription_type,
    } = req.query;
    const offset = (page - 1) * limit;
    const queryParams = [];
    let query = `
        SELECT 
            u.user_id, 
            u.firstname, 
            u.lastname, 
            u.email, 
            a.address_name, 
            a.address, 
            a.state, 
            a.city, 
            a.pincode, 
            a.phone_number AS address_phone_number,
            ci.id AS invoice_id, 
            ci.customer_name, 
            ci.customer_gstno, 
            ci.total_price, 
            ci.currency, 
            ci.invoice_link, 
            ci.transaction_id, 
            ci.invoice_date, 
            ci.createdAt AS invoice_createdAt, 
            ci.updatedAt AS invoice_updatedAt, 
            s.type AS subscription_type, 
            s.credit_amount, 
            s.duration, 
            s.benefits, 
            s.sequence, 
            s.createdAt AS subscription_createdAt, 
            s.updatedAt AS subscription_updatedAt,
            ipd.product_description,
            ipd.amount, 
            ipd.discount, 
            ipd.taxable_value, 
            ipd.cgst_rate, 
            ipd.cgst_amount, 
            ipd.sgst_rate, 
            ipd.sgst_amount, 
            ipd.igst_rate, 
            ipd.igst_amount, 
            ipd.total_amount,
            us.start_date,
            us.end_date
        FROM 
            users u
        JOIN 
            customer_invoices ci ON u.user_id = ci.user_id
        JOIN 
            subscriptions s ON ci.subscription_id = s.id
        JOIN 
            addresses a ON ci.address_id = a.id
        JOIN 
            invoice_product_details ipd ON ci.id = ipd.invoice_id
        JOIN 
            user_subscriptions us ON ci.id = us.invoiceId
        `;

    let whereClauses = [];

    if (name) {
      whereClauses.push(
        `(u.firstname LIKE ? OR u.lastname LIKE ? OR u.email LIKE ?)`
      );
      queryParams.push(`%${name}%`, `%${name}%`, `%${name}%`);
    }

    if (start_date && end_date) {
      whereClauses.push(`(ci.invoice_date BETWEEN ? AND ?)`);
      queryParams.push(start_date, end_date);
    }

    if (subscription_type) {
      whereClauses.push(`s.type = ?`);
      queryParams.push(subscription_type);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

    query += ` ORDER BY ci.id DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [invoices] = await connection.query(query, queryParams);

    let countQuery = `
        SELECT COUNT(*) as totalCount
        FROM users u
        JOIN customer_invoices ci ON u.user_id = ci.user_id
        JOIN subscriptions s ON ci.subscription_id = s.id
        JOIN addresses a ON ci.address_id = a.id
        JOIN invoice_product_details ipd ON ci.id = ipd.invoice_id
        JOIN user_subscriptions us ON ci.id = us.invoiceId
        `;

    if (whereClauses.length > 0) {
      countQuery += ` WHERE ` + whereClauses.join(" AND ");
    }

    const [totalCountResult] = await connection.query(
      countQuery,
      queryParams.slice(0, -2)
    );
    const totalCount = totalCountResult[0].totalCount;

    const formattedInvoices = invoices.map((invoice) => {
      return {
        id: invoice.invoice_id,
        user: {
          user_id: invoice.user_id,
          firstname: invoice.firstname,
          lastname: invoice.lastname,
          email: invoice.email,
        },
        address: {
          address_name: invoice.address_name,
          address: invoice.address,
          state: invoice.state,
          city: invoice.city,
          pincode: invoice.pincode,
          phone_number: invoice.address_phone_number,
        },
        customer_name: invoice.customer_name,
        customer_gstno: invoice.customer_gstno,
        total_price: invoice.total_price,
        currency: invoice.currency,
        invoice_link: invoice.invoice_link,
        transaction_id: invoice.transaction_id,
        invoice_date: invoice.invoice_date,
        product_details: {
          product_description: invoice.product_description,
          amount: invoice.amount,
          discount: invoice.discount,
          taxable_value: invoice.taxable_value,
          cgst_rate: invoice.cgst_rate,
          cgst_amount: invoice.cgst_amount,
          sgst_rate: invoice.sgst_rate,
          sgst_amount: invoice.sgst_amount,
          igst_rate: invoice.igst_rate,
          igst_amount: invoice.igst_amount,
          total_amount: invoice.total_amount,
        },
        subscription: {
          subscription_id: invoice.subscription_id,
          type: invoice.subscription_type,
          credit_amount: invoice.credit_amount,
          duration: invoice.duration,
          benefits: invoice.benefits,
          start_date: invoice.start_date,
          end_date: invoice.end_date,
        },
        createdAt: invoice.invoice_createdAt,
        updatedAt: invoice.invoice_updatedAt,
      };
    });

    res.json(
      new ApiResponse(200, {
        invoices: formattedInvoices,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: Number(limit),
        },
      })
    );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiResponse(500, "An error occurred", error.message));
  } finally {
    connection.release();
  }
};

export const getFreeTrailSubscriptionDataController = async (
  req,
  res,
  next
) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const connection = await pool.getConnection();

  try {
    const query = `
        SELECT 
        u.user_id, 
        u.firstname, 
        u.lastname, 
        u.email,
        s.id AS subscription_id,
        s.type AS subscription_type, 
        s.credit_amount, 
        s.duration, 
        s.benefits, 
        s.sequence, 
        s.createdAt AS subscription_createdAt, 
        s.updatedAt AS subscription_updatedAt,
        us.start_date,
        us.end_date
    FROM 
        user_subscriptions us
    JOIN 
        users u ON us.user_id = u.user_id
    JOIN 
        subscriptions s ON us.subscription_id = s.id
    WHERE 
        s.id = ?

        LIMIT ${limit} OFFSET ${offset}
      `;

    const [subscriptions] = await connection.query(query, [1]);

    if (!subscriptions.length) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No subscription found"));
    }

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM 
            users u
        JOIN 
            user_subscriptions us ON u.user_id = us.user_id
        JOIN 
            subscriptions s ON us.id = s.id
        WHERE 
            s.id = ?
      `;

    const [[{ total }]] = await connection.query(countQuery, [1]);

    const formattedSubscriptions = subscriptions.map((subscription) => ({
      user: {
        user_id: subscription.user_id,
        firstname: subscription.firstname,
        lastname: subscription.lastname,
        email: subscription.email,
      },
      subscription: {
        subscription_id: subscription.subscription_id,
        type: subscription.subscription_type,
        credit_amount: subscription.credit_amount,
        duration: subscription.duration,
        benefits: subscription.benefits,
        sequence: subscription.sequence,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        createdAt: subscription.subscription_createdAt,
        updatedAt: subscription.subscription_updatedAt,
      },
    }));

    res.json(
      new ApiResponse(200, {
        subscriptions: formattedSubscriptions,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: Number(limit),
        },
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(new ApiResponse(500, "An error occurred", error.message));
  } finally {
    if (connection) connection.release();
  }
};

export const getAllSubscriptionController = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const [subscriptions] = await connection.query(
      "SELECT * FROM subscriptions"
    );
    res.json(new ApiResponse(200, subscriptions));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiResponse(500, "An error occurred", error.message));
  } finally {
    connection.release();
  }
};

export const exportAllSubscriptionController = async (req, res, next) => {
  try {
    const { name, start_date, end_date, subscription_type, link } = req.body;
    const queryParams = [];
    let whereClauses = [];

    let query = `
        SELECT 
            ci.id,
            u.user_id, 
            u.firstname, 
            u.lastname, 
            s.type AS subscription_type, 
            us.start_date,
            us.end_date,
            ci.transaction_id, 
            ci.invoice_link, 
            ci.invoice_date,
            ci.total_price, 
            ci.currency
        FROM 
            users u
        JOIN 
            customer_invoices ci ON u.user_id = ci.user_id
        JOIN 
            subscriptions s ON ci.subscription_id = s.id
        JOIN 
            user_subscriptions us ON ci.id = us.invoiceId
        `;

    if (name) {
      whereClauses.push(
        `(u.firstname LIKE ? OR u.lastname LIKE ? OR u.email LIKE ?)`
      );
      queryParams.push(`%${name}%`, `%${name}%`, `%${name}%`);
    }

    if (start_date && end_date) {
      whereClauses.push(`(ci.invoice_date BETWEEN ? AND ?)`);
      queryParams.push(start_date, end_date);
    }

    if (subscription_type) {
      whereClauses.push(`s.type = ?`);
      queryParams.push(subscription_type);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }
    query += ` ORDER BY ci.id DESC`;

    const [subscriptionsRows] = await pool.query(query, queryParams);

    if (!subscriptionsRows.length)
      throw new CustomError(404, "No subscriptions found");

    const csvData = subscriptionsRows.map((subscription) => ({
      id: subscription.id,
      user_id: subscription.user_id,
      user_name: subscription.firstname + " " + subscription.lastname,
      subscription_type: subscription.subscription_type,
      subscription_start_date: formatDateTime(subscription.start_date),
      subscription_end_date: formatDateTime(subscription.end_date),
      transaction_id: subscription.transaction_id,
      invoice_link: (link ? link : "") + subscription.invoice_link,
      invoice_date: formatDateTime(subscription.invoice_date),
      total_price: subscription.total_price,
      currency: subscription.currency,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Subscriptions");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "User ID", key: "user_id", width: 10 },
      { header: "User Name", key: "user_name", width: 30 },
      { header: "Subscription Type", key: "subscription_type", width: 30 },
      {
        header: "Subscription Start Date",
        key: "subscription_start_date",
        width: 20,
      },
      {
        header: "Subscription End Date",
        key: "subscription_end_date",
        width: 20,
      },
      { header: "Transaction ID", key: "transaction_id", width: 30 },
      { header: "Invoice Link", key: "invoice_link", width: 30 },
      { header: "Total Price", key: "total_price", width: 20 },
      { header: "Currency", key: "currency", width: 20 },
      { header: "Invoice Date", key: "invoice_date", width: 20 },
    ];

    worksheet.addRows(csvData);

    res.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.attachment(`user_subscriptions_${new Date().toISOString()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
