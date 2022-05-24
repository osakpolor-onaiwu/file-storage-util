import express from 'express';
import login from './login';
import { extractClientInfo } from './middleware';
import { refreshUserToken } from './refresh-token';
import register from './register';
const router = express.Router();

router.post('/register', register);
router.post('/authenticate', extractClientInfo, login);
router.post('/token/referesh', extractClientInfo, refreshUserToken);
router.post('/logout', extractClientInfo, refreshUserToken);
//other methods here


export default router;