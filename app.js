import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userAppRoutes from './routes/App/userAppRoutes.js';
import advertisementAppRoutes from './routes/App/advertisementAppRoutes.js';
import bannerAppRoutes from './routes/App/bannerAppRoutes.js';
import bannerAdminRoutes from './routes/Admin/bannerAdminRoutes.js';
import advertisementAdminRoutes from './routes/Admin/advertisementAdminRoutes.js';

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'media')));


//Application Routes
app.use('/api/app/users', userAppRoutes);
app.use('/api/app/banners', bannerAppRoutes);
app.use('/api/app/advertisements', advertisementAppRoutes);

//Admin Routes
app.use('/api/admin/banners', bannerAdminRoutes);
app.use('/api/admin/advertisements', advertisementAdminRoutes);
