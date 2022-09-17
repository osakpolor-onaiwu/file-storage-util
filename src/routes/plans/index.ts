import express from 'express';
const router = express.Router();
import create_plan from './create';
import fetch_plans from './fetch_plans';
import { validateUserToken } from '../../middlewares/validate.user.token';

router.post('/create_plan', validateUserToken,create_plan);
router.get('/fetch_plans', fetch_plans);
//other methods here

export default router;