import express from 'express';
const router = express.Router();
import upload from './upload';
import handlefile from '../../middlewares/handlefile';
import multerconfig from '../../middlewares/multerconfig'
import s3file from '../../middlewares/s3.file'

router.post('/upload', s3file, handlefile, upload);
//other methods here

export default router;