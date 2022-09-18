import express from 'express';
const router = express.Router();
import create_plan from './create';
import fetch_plans from './fetch_plans';
import fetch_user_plan from './fetch_user_plan';
import choose_plan from './choose_plan';
import { validateUserToken } from '../../middlewares/validate.user.token';

router.post('/create_plan', validateUserToken, create_plan);
router.get('/fetch_plans', fetch_plans);
router.post('/choose_plan', validateUserToken, choose_plan);
router.get('/fetch_user_plans', validateUserToken, fetch_user_plan);
//other methods here

export default router;