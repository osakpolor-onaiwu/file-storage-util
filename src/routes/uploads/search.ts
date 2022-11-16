import { search } from '../../services/uploads/search'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';

export default async function (req: any, res: any, next: any) {
    if(req?.query?.user_id) req.query.account_id = String(req?.query?.user_id);
    try {
        const searchs: any = await search(req.query);
        jsonS(res, searchs?.message, searchs?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null)
    }
}