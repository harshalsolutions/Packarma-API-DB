import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";
import { dirname } from 'path';

// Importing routes
import userAppRoutes from './routes/App/userAppRoutes.js';
import advertisementAppRoutes from './routes/App/advertisementAppRoutes.js';
import bannerAppRoutes from './routes/App/bannerAppRoutes.js';
import productAppRoutes from './routes/App/productAppRoutes.js';
import referalAppRoutes from './routes/App/referralAppRoutes.js';
import addressAppRoutes from "./routes/App/addressAppRoutes.js";
import invoiceAppRoutes from "./routes/App/InvoiceAppRoutes.js";
import subscriptionAppRoutes from "./routes/App/SubscriptionCreditAppRoutes.js";
import AppDataRoutes from "./routes/App/AppDataRoutes.js";
import PaymentAppRoutes from "./routes/App/PaymentRoute.js";

import bannerAdminRoutes from './routes/Admin/Master/bannerAdminRoutes.js';
import advertisementAdminRoutes from './routes/Admin/Master/advertisementAdminRoutes.js';
import AuthAdminRoutes from "./routes/Admin/AuthAdminRoutes.js";
import SubscriptionAdminRoutes from "./routes/Admin/Master/SubscriptionAdminRoutes.js";
import CreditMasterAdminRoutes from "./routes/Admin/Master/CreditMasterAdminRoute.js";

import SubCategoryAdminRoutes from './routes/Admin/Product/SubCategoryAdminRoutes.js';
import CategoryAdminRoutes from './routes/Admin/Product/CategoryAdminRoutes.js';
import ProductFormAdminRoutes from "./routes/Admin/Product/ProductFormAdminRoutes.js";
import PackagingMachineAdminRoutes from "./routes/Admin/Product/PackagingMachineAdminRoutes.js";
import PackingTypeAdminRoutes from "./routes/Admin/Product/PackingTypeAdminRoutes.js";
import PackagingTreatmentAdminRoutes from "./routes/Admin/Product/PackagingTreatmentAdminRoutes.js";
import StorageConditionAdminRoutes from "./routes/Admin/Product/StorageConditionAdminRoutes.js";
import MeasurementUnitAdminRoutes from "./routes/Admin/Product/MeasurementUnitAdminRoutes.js";
import ProductAdminRoutes from "./routes/Admin/Product/ProductAdminRoutes.js";
import PackagingMaterialAdminRoutes from "./routes/Admin/Product/PackagingMaterialAdminRoute.js";
import PackagingSolutionAdminRoutes from "./routes/Admin/Product/PackagingSolutionAdminRoute.js";

import userCustomerRoutes from './routes/Admin/Customer/UserAdminRoutes.js';
import referralAdminRoutes from './routes/Admin/Customer/ReferalAdminRoutes.js';
import creditPurchaseAdminRoutes from "./routes/Admin/Customer/CreditPurchaseRoutes.js"

import authMiddleware from './middlewares/authMiddleware.js';

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

const appRoutes = [
    { path: '/api/app/users', route: userAppRoutes },
    { path: '/api/app/banners', route: bannerAppRoutes },
    { path: '/api/app/advertisements', route: advertisementAppRoutes },
    { path: '/api/app/product', route: productAppRoutes },
    { path: '/api/app/referral', route: referalAppRoutes },
    { path: '/api/app/address', route: addressAppRoutes },
    { path: '/api/app/invoice', route: invoiceAppRoutes },
    { path: '/api/app/subscription', route: subscriptionAppRoutes },
    { path: '/api/app/data', route: AppDataRoutes },
    { path: '/api/app/payment', route: PaymentAppRoutes },
];

appRoutes.forEach(({ path, route }) => app.use(path, route));

app.use('/api/admin/auth', AuthAdminRoutes);

const masterRoutes = [
    SubscriptionAdminRoutes,
    CreditMasterAdminRoutes,
    bannerAdminRoutes,
    advertisementAdminRoutes,
];

masterRoutes.forEach(route => app.use('/api/admin/master', authMiddleware, route));

const productRoutes = [
    CategoryAdminRoutes,
    SubCategoryAdminRoutes,
    ProductFormAdminRoutes,
    PackagingMachineAdminRoutes,
    PackingTypeAdminRoutes,
    PackagingTreatmentAdminRoutes,
    StorageConditionAdminRoutes,
    MeasurementUnitAdminRoutes,
    ProductAdminRoutes,
    PackagingMaterialAdminRoutes,
    PackagingSolutionAdminRoutes,
];

productRoutes.forEach(route => app.use('/api/admin/product', authMiddleware, route));

app.use('/api/admin/customer/users', authMiddleware, userCustomerRoutes);
app.use('/api/admin/customer/referrals', referralAdminRoutes);
app.use('/api/admin/customer/credit-purchase', creditPurchaseAdminRoutes);

