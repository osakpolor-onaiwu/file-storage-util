import { create } from '../../services/charge/create_plan'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';

export default async function (req: any, res: any, next: any) {
    try {
        if(req?.query?.user_id) req.body.account_id =  String(req?.query?.user_id);
      
        const create_plan: any = await create(req.body);
        jsonS(res, create_plan?.message, create_plan?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null)
    }
}