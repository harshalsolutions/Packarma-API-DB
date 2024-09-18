import express from 'express';
import {
    getTotalUserCount,
    getTotalFreeSubscriptionCount,
    getTotalPaidSubscriptionCount,
    getTotalActiveSubscriptionCount,
    getTotalSignupsFromReferrals,
    getTotalEnquiriesCount,
    getTotalRevenue,
    getTotalSubscriptionsFromReferralSignups,
    getUserComparison,
    getReferralTaskCompletion
} from '../../controllers/Admin/dashboardController.js';


const router = express.Router();

router.get('/total-users', getTotalUserCount);
router.get('/total-free-subscriptions', getTotalFreeSubscriptionCount);
router.get('/total-paid-subscriptions', getTotalPaidSubscriptionCount);
router.get('/total-active-subscriptions', getTotalActiveSubscriptionCount);
router.get('/total-signups-referrals', getTotalSignupsFromReferrals);
router.get('/total-enquiries', getTotalEnquiriesCount);
router.get('/total-revenue', getTotalRevenue);
router.get('/total-subscriptions-referral-signups', getTotalSubscriptionsFromReferralSignups);
router.get('/user-comparison', getUserComparison);
router.get('/referral-task-completion', getReferralTaskCompletion);

export default router;
