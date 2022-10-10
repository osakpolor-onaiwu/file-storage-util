import express from 'express';
const router = express.Router();
import search from './search';
import deletes from './delete';
import get_download from './getdownload';
import { validateUserToken } from '../../middlewares/validate.user.token';

router.get('/search', validateUserToken, search);
router.get('/get_download', validateUserToken, get_download);
router.post('/delete', validateUserToken, deletes);

export default router;