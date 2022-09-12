import express from 'express';
const router = express.Router();
import upload from './uploads';
import deletes from './delete';
import { validateUserToken } from '../../middlewares/validate.user.token';

router.get('/search', validateUserToken, upload);
router.post('/delete', validateUserToken, deletes);

export default router;