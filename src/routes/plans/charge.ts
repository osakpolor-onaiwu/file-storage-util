import { charge } from '../../services/charge/charge'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';

export default async function (req: any, res: any, next: any) {
    try {
        if(req?.query?.user_id) req.body.account_id =  String(req?.query?.user_id);
      
        const charge_customer: any = await charge(req.body);
        jsonS(res, charge_customer?.message, charge_customer?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null)
    }
}