import express from 'express';
const router = express.Router();
import search from './search';
import deletes from './delete';
import { validateUserToken } from '../../middlewares/validate.user.token';

router.get('/search', validateUserToken, search);
router.post('/delete', validateUserToken, deletes);

export default router;