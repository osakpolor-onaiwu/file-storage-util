import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import DownloadModel, { Download }from '../../models/download';
import { findDownload,  countDocument} from '../../dal/download';
import Logger from '../../utils/Logger';
import moment from 'moment';
import {normalizer} from '../../utils/normalizer'

const spec = joi.object({
    from: joi.date().iso(),
    to: joi.date().iso(),
    name: joi.string().trim(),
    type: joi.string().trim().valid('document upload','document conversion', 'image upload','image conversion'),
    account_id: joi.string().trim().required(),
    page: joi.number(),
    limit: joi.number().default(10),
    id: joi.string()
})

export async function upload(data: any) {
   console.log(data)
    try {
        const params = validateSchema(spec, data);
        const paramsclone = { ...params };
        const page = paramsclone.page || 1;
        delete paramsclone.page;
        const skip = (page - 1) * paramsclone.limit;
      
        const listConfig: any = {};
        if (paramsclone.from || paramsclone.to) {
            listConfig.createdAt = {};
            if (paramsclone.from) {
              listConfig.createdAt.$gte = new Date(paramsclone.from);
            }
      
            if (paramsclone.to) {
              listConfig.createdAt.$lte = new Date(paramsclone.to);
            }
          }

          if(paramsclone.account_id) listConfig.accountid = paramsclone.account_id;
          if (paramsclone.id) listConfig.id = paramsclone.id;
          if(paramsclone.type) listConfig.type = paramsclone.type;
          if (paramsclone.name){
            listConfig.file= {};
            const regexp = new RegExp(paramsclone.name, 'i');
            listConfig.file.$regex = regexp;
          }
          
          const uploads: any = await findDownload(listConfig, DownloadModel, 'all', '', {
            limit: paramsclone.limit,
            skip,
          });
    
          if (!uploads) throw new Error('You have no uploads');
    
          const count = await countDocument(listConfig, DownloadModel);
    
          const response = uploads.map((item: any) => {
            item.createdAt = moment(item.createdAt).format('Do MMMM YYYY hh:mm a');
            if (item.createdAt === 'Invalid Date') item.createdAt = 'n/a';
            return normalizer.uploads(item);
          });
        return {
            data:{
                page_info: {
                    total_volume: count,
                    current_page: page,
                    page_size: paramsclone.limit,
                    total_page: Math.ceil(count / paramsclone.limit),
                },
                response
            }
        }

    } catch (error: any) {
        console.log(error);
        Logger.errorX([error, error.stack, new Date().toJSON()], 'FETCH-UPLOADS-ERRROR');
        throwcustomError(error.message);
    }
}