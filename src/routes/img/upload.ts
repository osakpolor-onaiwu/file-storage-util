import { upload } from '../../services/images/upload'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';
import { NextFunction, Request, Response } from 'express';

export default async function (req: Request, res: Response, next: NextFunction) {
    try {
        if(req?.query?.user_id) req.body.account_id =  String(req?.query?.user_id);;
        if (req.file) req.body.file = req.file;

        const uploads: any = await upload(req.body);
        jsonS(res, uploads?.message, uploads?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null);
    }
}