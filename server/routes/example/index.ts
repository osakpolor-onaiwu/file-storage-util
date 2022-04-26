import express from 'express';
const router = express.Router();
import example from './handlers/examplehandler';

router.get('/example', example);
//other methods here


export default router;