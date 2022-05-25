import express from 'express';
const router = express.Router();
import docRoute from './docs';
import imgRoute from './img';
import userRoute from './user';

router.get('/',(req,res)=>{
    res.json({
        app:'file storage util',
        status:'running',
    })
});

router.use('/docs', docRoute);
router.use('/img', imgRoute);
router.use('/user', userRoute);


export default router;