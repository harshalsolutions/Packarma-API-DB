import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userAppRoutes from './routes/App/userAppRoutes.js';
import advertisementAppRoutes from './routes/App/advertisementAppRoutes.js';
import bannerAppRoutes from './routes/App/bannerAppRoutes.js';
import productAppRoutes from './routes/App/productAppRoutes.js';
import referalAppRoutes from './routes/App/referralAppRoutes.js';
import addressAppRoutes from "./routes/App/addressAppRoutes.js"

import bannerAdminRoutes from './routes/Admin/bannerAdminRoutes.js';
import advertisementAdminRoutes from './routes/Admin/advertisementAdminRoutes.js';

export const app = express();

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'media')));


//Application Routes
app.use('/api/app/users', userAppRoutes);
app.use('/api/app/banners', bannerAppRoutes);
app.use('/api/app/advertisements', advertisementAppRoutes);
app.use('/api/app/product', productAppRoutes);
app.use('/api/app/referral', referalAppRoutes);
app.use('/api/app/address', addressAppRoutes);

//Admin Routes
app.use('/api/admin/banners', bannerAdminRoutes);
app.use('/api/admin/advertisements', advertisementAdminRoutes);
