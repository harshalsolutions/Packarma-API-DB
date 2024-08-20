import dotenv from 'dotenv';
import { app } from './app.js';
import ErrorHandler from './middlewares/ErrorHandler.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(ErrorHandler);

app.get('/', (req, res) => {
    res.send('Hello I am Working! 🚀');
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Error starting server:', err);
});
