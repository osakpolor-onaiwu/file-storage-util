import express from 'express';
const router = express.Router();
import docRoute from './docs';
import imgRoute from './img';
import userRoute from './user';
import uploadsRoute from './uploads';
import plansRoute from './plans'

router.get('/',(req,res)=>{
    res.json({
        app:'file storage util',
        status:'running',
    })
});

router.use('/docs', docRoute);
router.use('/img', imgRoute);
router.use('/user', userRoute);
router.use('/uploads', uploadsRoute);
router.use('/plans', plansRoute);


export default router;