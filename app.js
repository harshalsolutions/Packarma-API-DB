import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors"
import { dirname } from 'path';

import userAppRoutes from './routes/App/userAppRoutes.js';
import advertisementAppRoutes from './routes/App/advertisementAppRoutes.js';
import bannerAppRoutes from './routes/App/bannerAppRoutes.js';
import productAppRoutes from './routes/App/productAppRoutes.js';
import referalAppRoutes from './routes/App/referralAppRoutes.js';
import addressAppRoutes from "./routes/App/addressAppRoutes.js"
import invoiceAppRoutes from "./routes/App/InvoiceAppRoutes.js"
import subscriptionAppRoutes from "./routes/App/SubscriptionCreditAppRoutes.js"
import AppDataRoutes from "./routes/App/AppDataRoutes.js"
import PaymentAppRoutes from "./routes/App/PaymentRoute.js"

import bannerAdminRoutes from './routes/Admin/Master/bannerAdminRoutes.js';
import advertisementAdminRoutes from './routes/Admin/Master/advertisementAdminRoutes.js';
import AuthAdminRoutes from "./routes/Admin/AuthAdminRoutes.js"
import SubscriptionAdminRoutes from "./routes/Admin/Master/SubscriptionAdminRoutes.js"
import CreditMasterAdminRoutes from "./routes/Admin/Master/CreditMasterAdminRoute.js"

import SubCategoryAdminRoutes from './routes/Admin/Product/SubCategoryAdminRoutes.js';
import CategoryAdminRoutes from './routes/Admin/Product/CategoryAdminRoutes.js';
import ProductFormAdminRoutes from "./routes/Admin/Product/ProductFormAdminRoutes.js"
import PackagingMachineAdminRoutes from "./routes/Admin/Product/PackagingMachineAdminRoutes.js"
import PackingTypeAdminRoutes from "./routes/Admin/Product/PackingTypeAdminRoutes.js"
import PackagingTreatmentAdminRoutes from "./routes/Admin/Product/PackagingTreatmentAdminRoutes.js"
import StorageConditionAdminRoutes from "./routes/Admin/Product/StorageConditionAdminRoutes.js"
import MeasurementUnitAdminRoutes from "./routes/Admin/Product/MeasurementUnitAdminRoutes.js"

export const app = express();

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));
const allowedOrigins = [process.env.ADMIN_FRONTEND_URL, 'http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

//Application Routes
app.use('/api/app/users', userAppRoutes);
app.use('/api/app/banners', bannerAppRoutes);
app.use('/api/app/advertisements', advertisementAppRoutes);
app.use('/api/app/product', productAppRoutes);
app.use('/api/app/referral', referalAppRoutes);
app.use('/api/app/address', addressAppRoutes);
app.use('/api/app/invoice', invoiceAppRoutes);
app.use('/api/app/subscription', subscriptionAppRoutes);
app.use('/api/app/data', AppDataRoutes);

app.use('/api/app/payment', PaymentAppRoutes);

//Admin Routes
app.use('/api/admin/auth', AuthAdminRoutes);

// Master Routes
app.use('/api/admin/master', SubscriptionAdminRoutes);
app.use('/api/admin/master', CreditMasterAdminRoutes);
app.use('/api/admin/master', bannerAdminRoutes);
app.use('/api/admin/master', advertisementAdminRoutes);
//Product Master Routes
app.use('/api/admin/product', CategoryAdminRoutes);
app.use('/api/admin/product', SubCategoryAdminRoutes);
app.use('/api/admin/product', ProductFormAdminRoutes);
app.use('/api/admin/product', PackagingMachineAdminRoutes);
app.use('/api/admin/product', PackingTypeAdminRoutes);
app.use('/api/admin/product', PackagingTreatmentAdminRoutes);
app.use('/api/admin/product', StorageConditionAdminRoutes);
app.use('/api/admin/product', MeasurementUnitAdminRoutes);


