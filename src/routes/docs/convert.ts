import { convert } from '../../services/docs/convert'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';

export default async function (req: any, res: any, next: any) {
    try {
        if (req.file) req.body.file = req.file;
        // console.log(req.body);
        const transform: any = await convert(req.body);
        jsonS(res, transform?.message, transform?.data);

    } catch (e: any) {
        // console.log('con--',e)
        jsonErr(res, e.message, null)
    }
}