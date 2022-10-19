import express from 'express';
import login from './login';
import { extractClientInfo } from '../../middlewares/extract.client.info';
import { refreshUserToken } from './refresh-token';
import register from './register';
import { validateUserToken , user_details} from '../../middlewares/validate.user.token';
import { NextFunction, Request, Response } from 'express';
import userLogout from './logout';
const router = express.Router();

router.post('/register', register);
router.post('/login', extractClientInfo, login);
router.post('/token/referesh', extractClientInfo, refreshUserToken);
router.post('/logout', extractClientInfo, userLogout);
router.get('/user_detail', user_details);


export default router;