import { getplan } from '../../services/charge/fetchall_plans'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';

export default async function (req: any, res: any, next: any) {
    try {
        if(req?.query?.user_id) req.body.account_id = String(req?.query?.user_id);
       
        const fetch_plans: any = await getplan(req.body);
        jsonS(res, fetch_plans?.message, fetch_plans?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null);
    }
}