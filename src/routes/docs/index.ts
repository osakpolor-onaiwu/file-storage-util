import express from 'express';
const router = express.Router();
import upload from './upload';
import convert from './convert';
import s3file from '../../middlewares/s3.file';
import { validateUserToken } from '../../middlewares/validate.user.token';

router.post('/upload', validateUserToken, s3file, upload);
router.post('/convert', s3file, convert);
//other methods here

export default router;