import dotenv from 'dotenv';
import express from 'express';
import ErrorHandler from './middlewares/ErrorHandler.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/app/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello I am Working! 🚀');
});

app.use(ErrorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Error starting server:', err);
});
