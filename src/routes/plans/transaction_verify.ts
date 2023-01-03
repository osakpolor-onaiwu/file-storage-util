import { verify } from '../../services/charge/flw_verify'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';
import { NextFunction, Request, Response } from 'express';

export default async function (req: Request, res: Response, next: NextFunction) {
    try {
        // if(req?.query?.user_id) req.query.account_id =  String(req?.query?.user_id);
      
        const verify_transaction : any = await verify(req.query);
        jsonS(res, verify_transaction ?.message, verify_transaction ?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null);
    }
}