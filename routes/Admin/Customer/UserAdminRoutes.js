import express from 'express';
import { getAllUsersController } from '../../../controllers/Customer/UserController.js';

const router = express.Router();

router.get('/', getAllUsersController);

export default router;