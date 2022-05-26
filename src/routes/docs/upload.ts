import { upload } from '../../services/docs/upload'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';

export default async function (req: any, res: any, next: any) {
    try {
             if(req?.query?.user_id) req.body.account_id = String(req?.query?.user_id);
        if (req.file) req.body.file = req.file;

        const uploads: any = await upload(req.body);
        jsonS(res, uploads?.message, uploads?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null);
    }
}