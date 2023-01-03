import { create } from '../../services/charge/plan'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';
import { NextFunction, Request, Response } from 'express';

export default async function (req: Request, res: Response, next: NextFunction) {
    try {
        if(req?.query?.user_id) req.body.account_id =  String(req?.query?.user_id);
      
        const create_plan: any = await create(req.body);
        jsonS(res, create_plan?.message, create_plan?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null)
    }
}