import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger'
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';


const spec = joi.object({
    account_id: joi.string().trim().required(),
    redirect_url:joi.string().trim().uri().required(),
    customer: joi.object().required(),
    amount: joi.number().required(),
    currency: joi.string().trim().uppercase().length(3).default('NGN'),
    meta: joi.object().required(),
})


export async function upload(data: any) {
    
    try {
        const params = validateSchema(spec, data);
        
    } catch (error: any) {        
        throwcustomError(error.message);
    }
}