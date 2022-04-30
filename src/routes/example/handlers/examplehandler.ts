import {testservice} from '../../../services/test'; //path to service file
import { jsonS } from '../../../utils/responses';

export default async function (req:any, res:any, next:any) {
    try {
        const { data, message } = await testservice(req);
        jsonS(res, message, data);
    } catch (e) {
        next(e);
    }
}