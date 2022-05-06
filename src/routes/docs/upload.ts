import { upload } from '../../services/docs/upload'; //path to service file
import { jsonS } from '../../utils/responses';

export default async function (req:any, res:any, next:any) {
    try {
        if(req.file) req.body.file = req.file;
        console.log('req.body---',req.body);
      
        const uploads:any= await upload(req.body);
        jsonS(res, uploads?.message, uploads?.data);
    } catch (e) {
        next(e);
    }
}