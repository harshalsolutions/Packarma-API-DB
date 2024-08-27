import { handleError } from '../../utils/ErrorHandler.js';
import CustomError from '../../utils/CustomError.js';
import pdf from 'html-pdf';
import fs from 'fs';
import path, { format } from 'path';
import { totalInWords } from '../../utils/InvoiceUtils.js';

import { __dirname } from "../../app.js"

export const generateInvoiceController = async (req, res, next) => {
    try {
        const { invoice_no, invoice_date, customer_name, customer_gstin, state, products, customer_address } = req.body;

        const htmlPath = __dirname + "/utils/invoice.html";
        const htmlTemplate = fs.readFileSync(htmlPath, 'utf8');

        let productRows = '';
        let grand_total = 0;
        products.forEach((product, index) => {
            grand_total += product.total;
            productRows += `
                <tr style="height: 5rem">
                    <td class="table-data">${index + 1}</td>
                    <td class="table-data" colspan="4">${product.description}</td>
                    <td class="table-data">${product.amount}</td>
                    <td class="table-data">${product.discount}</td>
                    <td class="table-data">${product.taxable_value}</td>
                    <td class="table-data">${product.cgst_rate}</td>
                    <td class="table-data">${product.cgst_amount}</td>
                    <td class="table-data">${product.sgst_rate}</td>
                    <td class="table-data">${product.sgst_amount}</td>
                    <td class="table-data">${product.igst_rate}</td>
                    <td class="table-data">${product.igst_amount}</td>
                    <td class="table-data"><strong>${product.total}</strong></td>
                </tr>
            `;
        });

        const parsedTotal = parseFloat(grand_total.toFixed(2));

        const populatedHtml = htmlTemplate
            .replace(/{{invoice_no}}/g, invoice_no)
            .replace(/{{invoice_date}}/g, invoice_date)
            .replace(/{{customer_name}}/g, customer_name)
            .replace(/{{customer_address}}/g, customer_address)
            .replace(/{{customer_gstin}}/g, customer_gstin)
            .replace(/{{state}}/g, state)
            .replace(/{{grand_total}}/g, parsedTotal)
            .replace(/{{total_in_words}}/g, totalInWords(parsedTotal))
            .replace('{{PRODUCT_ROWS}}', productRows);

        const pdfFolder = path.join(__dirname, 'invoices');

        if (!fs.existsSync(pdfFolder)) {
            fs.mkdirSync(pdfFolder);
        }

        const pdfFilePath = path.join(pdfFolder, `invoice_${invoice_no}.pdf`);



        pdf.create(populatedHtml, { format: "Letter" }).toFile(pdfFilePath, (err, result) => {
            if (err) {
                return next(new CustomError(500, 'Failed to generate PDF'));
            }

            const pdfDownloadLink = `/invoices/${path.basename(pdfFilePath)}`;

            res.json({
                success: true,
                message: 'Invoice generated successfully',
                downloadLink: pdfDownloadLink
            });
        });
    } catch (error) {
        handleError(error, next);
    }
};
