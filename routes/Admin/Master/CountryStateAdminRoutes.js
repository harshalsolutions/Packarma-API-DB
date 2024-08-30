import express from 'express';
import { createCountryController, createStateController, deleteCountryController, deleteStateController, getAllCountriesController, getAllStatesController, updateCountryController, updateStateController } from '../../../controllers/Admin/Master/CountryAndStateController.js';

const router = express.Router();

router.get('/countries', getAllCountriesController);
router.post('/country', createCountryController);
router.put('/country/:id', updateCountryController);
router.delete('/country/:id', deleteCountryController);

router.get('/states', getAllStatesController);
router.post('/state', createStateController);
router.put('/state/:id', updateStateController);
router.delete('/state/:id', deleteStateController);


export default router;
