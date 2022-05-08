import { upload } from '../../services/docs/upload'; //path to service file
import { jsonS } from '../../utils/responses';

export default async function (req:any, res:any, next:any) {
    try {
        if(req.file) req.body.file = req.file;

        const uploads:any= await upload(req.body);
        jsonS(res, uploads?.message, uploads?.data);

    } catch (e) {
        throw e;
    }
}