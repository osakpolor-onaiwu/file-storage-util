import { fetchUserPlan } from '../../services/charge/user_plan'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';

export default async function (req: any, res: any, next: any) {
    try {
        if(req?.query?.user_id) req.body.account_id =  String(req?.query?.user_id);
      
        const fetch_user_plan: any = await fetchUserPlan(req.body);
        jsonS(res, fetch_user_plan?.message, fetch_user_plan?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null);
    }
}