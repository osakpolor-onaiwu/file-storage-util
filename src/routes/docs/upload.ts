import { upload } from '../../services/docs/upload'; //path to service file
import { jsonS, jsonErr } from '../../utils/responses';
import util from "util"
export default async function (req: any, res: any, next: any) {
    try {
        console.log("jjjj: ", req.query);
        if (req.file) req.body.file = req.file;

        const uploads: any = await upload(req.body);
        jsonS(res, uploads?.message, uploads?.data);

    } catch (e: any) {
        jsonErr(res, e.message, null);
    }
}