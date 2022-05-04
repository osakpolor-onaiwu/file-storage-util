import express from 'express';
const router = express.Router();
import docRoute from './docs';
//import routes here and do router.use to use the route


router.get('/',(req,res)=>{
    res.json({
        app:'file storage util',
        status:'running',
    })
});

router.use('/docs', docRoute);


export default router;