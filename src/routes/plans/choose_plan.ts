import { chooseUserPlan } from '../../services/charge/user_plan'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';
import { NextFunction, Request, Response } from 'express';

export default async function (req: Request, res: Response, next: NextFunction) {
    try {
        if(req?.query?.user_id) req.body.account_id =  String(req?.query?.user_id);
      
        const choose_plan: any = await chooseUserPlan(req.body);
        jsonS(res, choose_plan?.message, choose_plan?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null)
    }
}