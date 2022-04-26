import express from 'express';
const router = express.Router();
import exampleRoute from './example';
//import routes here and do router.use to use the route


router.get('/',(req,res)=>{
    res.json({
        app:'file storage util',
        status:'running',
    })
});

router.use('/example', exampleRoute);


export default router;