import express from 'express';
import login from './login';
import { extractClientInfo } from './middleware';
import register from './register';
const router = express.Router();

router.post('/register', register);
router.post('/authenticate', extractClientInfo, login);
//other methods here


export default router;