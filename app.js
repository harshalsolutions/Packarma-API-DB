import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userRoutes from './routes/App/userRoutes.js';
import bannerRoutes from './routes/Admin/bannerRoutes.js';
import advertisementRoutes from './routes/Admin/advertisementRoutes.js';

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'media')));


//Application Routes
app.use('/api/app/users', userRoutes);

//Admin Routes
app.use('/api/admin/banners', bannerRoutes);
app.use('/api/admin/advertisement', advertisementRoutes);
