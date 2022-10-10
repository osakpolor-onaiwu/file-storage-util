import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import DownloadModel, { Download }from '../../models/download';
import { findDownload,  countDocument} from '../../dal/download';
import Logger from '../../utils/Logger';
import { service_return } from '../../interface/service_response'

const spec = joi.object({
    account_id: joi.string().trim().required(),
    id: joi.string()
})

export async function getdownload(data: any) {
    try {
        const params = validateSchema(spec, data);
        const item = await findDownload({
            _id: params.id,
            accountid: params.account_id
        },
            DownloadModel,
            'one'
        )
        if (!item) throw new Error('Download not found');
        const is_successfull = item.url !== null? 'Successful' : 'Failed';
        const res : service_return = {
            message: `Download ${is_successfull}`,
            data: item.url,
        }
        return res
    } catch (error: any) {
       if(error.message.includes('Cast'))error.message = 'Please pass a valid id.';
        Logger.errorX([error, error.stack, new Date().toJSON()], 'FETCH-DOWNLOAD-ERROR');
        throwcustomError(error.message);
    }
}