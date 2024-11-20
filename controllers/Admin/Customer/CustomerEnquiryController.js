import ApiResponse from "../../../utils/ApiResponse.js";
import pool from "../../../config/database.js";
import CustomError from "../../../utils/CustomError.js";
import { formatDateTime } from "../../../utils/dateFormatter.js";
import ExcelJS from "exceljs";

export const getAllCustomerEnquiryController = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      userName,
      status,
      product,
      category,
      subCategory,
      fromDate,
      toDate,
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
            SELECT sh.*,
            ps.name, ps.image, ps.structure_type, ps.sequence, ps.storage_condition_id, ps.display_shelf_life_days, ps.product_id, ps.product_category_id, ps.product_form_id, 
            ps.packaging_treatment_id, ps.packing_type_id, pt.name AS packing_treatement_name, ptt.name AS packing_type_name, ps.packaging_machine_id, ps.packaging_material_id, ps.product_min_weight as original_product_min_weight, ps.product_max_weight as original_product_max_weight, 
            ps.min_order_quantity, ps.min_order_quantity_unit_id, ps.status, 
            u.firstname, u.lastname,
            p.product_name, p.id AS product_id, c.name AS category_name, sc.id AS subcategory_id, sc.name AS subcategory_name, pf.name AS product_form_name, pt.name AS packaging_treatment_name
            FROM search_history sh
            JOIN packaging_solution ps ON sh.packaging_solution_id = ps.id
            LEFT JOIN product p ON ps.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories sc ON p.sub_category_id = sc.id
            LEFT JOIN product_form pf ON ps.product_form_id = pf.id
            LEFT JOIN packing_type ptt ON ps.packing_type_id = ptt.id
            LEFT JOIN packaging_treatment pt ON ps.packaging_treatment_id = pt.id
            LEFT JOIN users u ON sh.user_id = u.user_id
            WHERE 1 = 1
        `;

    let countQuery = `
            SELECT COUNT(*) as totalCount 
            FROM search_history sh
            JOIN packaging_solution ps ON sh.packaging_solution_id = ps.id
            LEFT JOIN product p ON ps.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories sc ON p.sub_category_id = sc.id
            LEFT JOIN product_form pf ON ps.product_form_id = pf.id
            LEFT JOIN packing_type ptt ON ps.packing_type_id = ptt.id
            LEFT JOIN packaging_treatment pt ON ps.packaging_treatment_id = pt.id
            LEFT JOIN users u ON sh.user_id = u.user_id
            WHERE 1 = 1
        `;

    const queryParams = [];
    const countParams = [];

    if (userId) {
      query += " AND sh.user_id = ?";
      countQuery += " AND sh.user_id = ?";
      queryParams.push(userId);
      countParams.push(userId);
    }

    if (userName) {
      query += " AND CONCAT(u.firstname, ' ', u.lastname) LIKE ?";
      countQuery += " AND CONCAT(u.firstname, ' ', u.lastname) LIKE ?";
      queryParams.push(`%${userName}%`);
      countParams.push(`%${userName}%`);
    }

    if (status) {
      query += " AND sh.status = ?";
      countQuery += " AND sh.status = ?";
      queryParams.push(status);
      countParams.push(status);
    }

    if (product) {
      query += " AND ps.product_id LIKE ?";
      countQuery += " AND ps.product_id LIKE ?";
      queryParams.push(`%${product}%`);
      countParams.push(`%${product}%`);
    }

    if (category) {
      query += " AND ps.product_category_id = ?";
      countQuery += " AND ps.product_category_id = ?";
      queryParams.push(category);
      countParams.push(category);
    }

    if (subCategory) {
      query += " AND sc.id = ?";
      countQuery += " AND sc.id = ?";
      queryParams.push(subCategory);
      countParams.push(subCategory);
    }

    if (fromDate && toDate) {
      query += " AND sh.search_time BETWEEN ? AND ?";
      countQuery += " AND sh.search_time BETWEEN ? AND ?";
      queryParams.push(fromDate, toDate);
      countParams.push(fromDate, toDate);
    }

    query += " ORDER BY sh.search_time DESC, sh.id DESC LIMIT ? OFFSET ?";
    queryParams.push(parseInt(limit, 10), parseInt(offset, 10));

    const [enquiries] = await pool.query(query, queryParams);

    const [[{ totalCount }]] = await pool.query(countQuery, countParams);

    const totalPages = Math.ceil(totalCount / limit);

    if (!enquiries.length) {
      return res.json(
        new ApiResponse(
          200,
          {
            enquiries: [],
            pagination: {
              currentPage: page,
              totalPages,
              totalItems: totalCount,
              itemsPerPage: limit,
            },
          },
          "No enquiries found",
        ),
      );
    }

    res.json(
      new ApiResponse(200, {
        enquiries: enquiries,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: totalCount,
          itemsPerPage: Number(limit),
        },
      }),
    );
  } catch (error) {
    next(new CustomError(500, error.message));
  }
};

export const exportCustomerEnquiryController = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const {
      userId,
      userName,
      status,
      product,
      category,
      subCategory,
      fromDate,
      toDate,
    } = req.body;

    let query = `
            SELECT sh.*,
            ps.name, ps.image, ps.structure_type, ps.sequence, ps.storage_condition_id, ps.display_shelf_life_days, ps.product_id, ps.product_category_id, ps.product_form_id, 
            ps.packaging_treatment_id, ps.packing_type_id, pt.name AS packing_treatement_name, ptt.name AS packing_type_name, ps.packaging_machine_id, ps.packaging_material_id, ps.product_min_weight as original_product_min_weight, ps.product_max_weight as original_product_max_weight, 
            ps.min_order_quantity, ps.min_order_quantity_unit_id, ps.status, 
            u.firstname, u.lastname,
            p.product_name, p.id AS product_id, c.name AS category_name, sc.id AS subcategory_id, sc.name AS subcategory_name, pf.name AS product_form_name, pt.name AS packaging_treatment_name
            FROM search_history sh
            JOIN packaging_solution ps ON sh.packaging_solution_id = ps.id
            LEFT JOIN product p ON ps.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories sc ON p.sub_category_id = sc.id
            LEFT JOIN product_form pf ON ps.product_form_id = pf.id
            LEFT JOIN packing_type ptt ON ps.packing_type_id = ptt.id
            LEFT JOIN packaging_treatment pt ON ps.packaging_treatment_id = pt.id
            LEFT JOIN users u ON sh.user_id = u.user_id
            WHERE 1 = 1
        `;

    let countQuery = `
            SELECT COUNT(*) as totalCount 
            FROM search_history sh
            JOIN packaging_solution ps ON sh.packaging_solution_id = ps.id
            LEFT JOIN product p ON ps.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories sc ON p.sub_category_id = sc.id
            LEFT JOIN product_form pf ON ps.product_form_id = pf.id
            LEFT JOIN packing_type ptt ON ps.packing_type_id = ptt.id
            LEFT JOIN packaging_treatment pt ON ps.packaging_treatment_id = pt.id
            LEFT JOIN users u ON sh.user_id = u.user_id
            WHERE 1 = 1
        `;

    const queryParams = [];
    const countParams = [];

    if (userId) {
      query += " AND sh.user_id = ?";
      countQuery += " AND sh.user_id = ?";
      queryParams.push(userId);
      countParams.push(userId);
    }

    if (userName) {
      query += " AND CONCAT(u.firstname, ' ', u.lastname) LIKE ?";
      countQuery += " AND CONCAT(u.firstname, ' ', u.lastname) LIKE ?";
      queryParams.push(`%${userName}%`);
      countParams.push(`%${userName}%`);
    }

    if (status) {
      query += " AND sh.status = ?";
      countQuery += " AND sh.status = ?";
      queryParams.push(status);
      countParams.push(status);
    }

    if (product) {
      query += " AND ps.product_id LIKE ?";
      countQuery += " AND ps.product_id LIKE ?";
      queryParams.push(`%${product}%`);
      countParams.push(`%${product}%`);
    }

    if (category) {
      query += " AND ps.product_category_id = ?";
      countQuery += " AND ps.product_category_id = ?";
      queryParams.push(category);
      countParams.push(category);
    }

    if (subCategory) {
      query += " AND sc.id = ?";
      countQuery += " AND sc.id = ?";
      queryParams.push(subCategory);
      countParams.push(subCategory);
    }

    if (fromDate && toDate) {
      query += " AND sh.search_time BETWEEN ? AND ?";
      countQuery += " AND sh.search_time BETWEEN ? AND ?";
      queryParams.push(fromDate, toDate);
      countParams.push(fromDate, toDate);
    }

    query += " ORDER BY sh.search_time DESC, sh.id DESC";

    const invoices = await connection.query(query, queryParams);

    const csvData = invoices[0].map((invoice) => ({
      id: invoice.id,
      user_name: `${invoice.firstname} ${invoice.lastname}`,
      product_name: invoice.product_name,
      category_name: invoice.category_name,
      subcategory_name: invoice.subcategory_name,
      packaging_type_name: invoice.packing_type_name,
      shelf_life: invoice.display_shelf_life_days,
      product_weight: `${invoice.original_product_min_weight} - ${invoice.original_product_max_weight}`,
      weight_by_user: invoice.weight_by_user,
      searchtime: formatDateTime(invoice.search_time),
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Customer Enquiries");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "User Name", key: "user_name", width: 30 },
      { header: "Product Name", key: "product_name", width: 30 },
      { header: "Category Name", key: "category_name", width: 30 },
      { header: "Subcategory Name", key: "subcategory_name", width: 30 },
      { header: "Packaging Type Name", key: "packaging_type_name", width: 30 },
      { header: "Shelf Life", key: "shelf_life", width: 20 },
      { header: "Product Weight", key: "product_weight", width: 20 },
      { header: "Search Time", key: "searchtime", width: 20 },
    ];

    worksheet.addRows(csvData);

    res.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.attachment(`customer_enquiry_${new Date().toISOString()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiResponse(500, "An error occurred", error.message));
  } finally {
    connection.release();
  }
};
