import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger'
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';


const spec = joi.object({
    // account_id: joi.string().trim(),
    plan_name:joi.string(),
    duration: joi.object(),
    amount: joi.number(),
    currency: joi.string().trim().uppercase().length(3).default('NGN'),
    meta: joi.object(),
})


export async function getplan(data: any) {
    
    try {
        const params = validateSchema(spec, data);
        
    } catch (error: any) {        
        throwcustomError(error.message);
    }
}