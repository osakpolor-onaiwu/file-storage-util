import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import axios from "axios";
import s3Delete from '../../utils/s3.delete';
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';
import Logger from '../../utils/Logger';
import { service_return } from '../../interface/service_response';
import QueueModel, { Queue } from '../../models/queue';
import {saveQueueItem} from '../../worker/dal';

const spec = joi.object({
    url: joi.string().uri(),
    file: joi.object(),
    name: joi.string().trim().required().error(new Error('Please provide a name')),
    from: joi.any().valid('html').required(),
    to: joi.any().valid('pdf').required(),
    file_description:joi.string().trim().optional(),
    account_id: joi.string().trim().required(),
    options: joi.object({
        // rowDelimiter: joi.string().trim(),
    })
})


export async function convert(data: any) {

    let file_extension = null, file_name: string = '';
    let data_to_convert;
    let parsed_data = null;
    let file;
    let flag;

    try {
      
        const params = validateSchema(spec, data);
        // console.log(params);

        if (params.from === params.to) {
            throw new Error('from and to cannot be the same.');
        }

        if (params.url) {
            file_extension = path.extname(params?.url?.toLowerCase());
            if (file_extension !== `.${params.from}`) {
                throw new Error('Ensure the extention of the url is same as the from field supplied');
            }

            const get_file: any = await axios.get(params.url);
            if (!get_file || !get_file.data) throw new Error('The file in the url could not be found');
            file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
        }
      
        if (params.file) {
            file = params.file.key;
            const get_file: any = await axios.get(params.file?.location);
            
            if (!get_file || !get_file.data) throw new Error('The file in the url could not be found');
            file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
            data_to_convert = get_file.data;
            await s3Delete({ filename: params.file?.key });
        }
  
        const response = await saveDownload({
            file: params.name,
            key:file_name,
            url: 'N/A',
            accountid: params.account_id,
            type:'html conversion'
        },
            DownloadModel)

      
        saveQueueItem({
            data:{ file_extension, from:params.from, to:params.to, data_to_convert, filename:file_name, download_id: response._id},
            run_on:new Date(),
            status:'new',
            job:'converthtml'

        },QueueModel)
        const res: service_return = {
            message: "conversion in progress",
            data:response
        }

        return res;

    } catch (error: any) {
        Logger.error([error, error.stack, new Date().toJSON()], 'DOC-CONVERSION-ERROR');
        throwcustomError(error.message);
    }
}