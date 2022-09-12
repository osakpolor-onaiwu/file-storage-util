import { upload } from '../../services/uploads/upload'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';

export default async function (req: any, res: any, next: any) {
    if(req?.query?.user_id) req.query.account_id = String(req?.query?.user_id);
    try {
        const uploads: any = await upload(req.query);
        jsonS(res, uploads?.message, uploads?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null)
    }
}