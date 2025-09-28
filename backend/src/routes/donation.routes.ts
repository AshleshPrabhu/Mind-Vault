import { Router } from 'express';
import { 
    getUserTokenBalance, 
    getUserDonationHistory, 
    recordDonation 
} from '../controllers/donation.controller.js';

const router = Router();
router.get('/balance/:userId', getUserTokenBalance);
router.get('/history/:userId', getUserDonationHistory);
router.post('/record', recordDonation);

export default router;