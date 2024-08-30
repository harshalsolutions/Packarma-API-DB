import express from 'express';

import {

    createSubscriptionBenefitController,
    deleteSubscriptionBenefitController,
    getSubscriptionBenefitsController,
    updateSubscriptionBenefitController
} from '../../../controllers/Admin/Master/SubscriptionBenefitsController.js';

const router = express.Router();

router.get('/benefit/:id', getSubscriptionBenefitsController);
router.post('/benefit', createSubscriptionBenefitController);
router.put('/benefit/:id', updateSubscriptionBenefitController);
router.delete('/benefit/:id', deleteSubscriptionBenefitController);

export default router;
