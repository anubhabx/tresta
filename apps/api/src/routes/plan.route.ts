import express, { Router } from 'express';
import { PlanService } from '../services/plan.service.js';

const router: Router = express.Router();

router.get('/', async (req, res) => {
    try {
        const plans = await PlanService.getPlans();
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
