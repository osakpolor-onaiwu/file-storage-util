import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import QueueModel, { Queue } from '../../models/queue';
import { findQueueItem,saveQueueItem } from '../../worker/dal';
import Logger from '../../utils/Logger'
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';
import { service_return } from '../../interface/service_response'


const spec = joi.object({
    url: joi.string().uri(),
    type: joi.any().valid('png', 'bmp', 'jpeg', 'jpg').required(),
    name: joi.string().trim().required().error(new Error('Please provide a name')),
    file: joi.object(),
    file_description: joi.string().trim().optional(),
    account_id: joi.string().trim().required(),
})

export async function upload(data: any) {
    let file_name: string = '';
    let file_extension = null;
    let file = null;
    try {

        const params = validateSchema(spec, data);
        let file_url = null;
        console.log(params);
        if (params.file) {
            file_url = params?.file.location;
            saveDownload({
                file: params.name,
                url: params?.file.location,
                accountid: params.account_id,
                key: params.file.key,
                type: 'image upload'
            },
                DownloadModel)
            return {
                message: "upload successful",
                data: {
                    file_name: params.name,
                    location: file_url,
                    original_name: params?.file?.originalname,
                },
            }
        }

        if (params.url) {

            if (!params.name) throw new Error('Please provide a file name for this url');
            file_extension = path.extname(params?.url?.toLowerCase());
            if(!file_extension) throw new Error('Please provide a url with an image extension')
            if (file_extension !== `.${params.type}`) {
                throw new Error('The extention of your file is different from the type you specified');
            }

            file_name = `${Date.now() + '-' + params.name}${file_extension}`;
            file = params.url;
        }

        const response = await saveDownload({
            file: params.name,
            key: file_name,
            url: 'N/A',
            accountid: params.account_id,
            type: 'image upload'
        }, DownloadModel)
        
        saveQueueItem({
            data: { file, filename: file_name, download_id: response._id },
            run_on: new Date(),
            status: 'new',
            job: 'uploadimg'

        }, QueueModel)
     
        const res: service_return = {
            message: "upload in progress",
            data: {
                file_name: params.name,
                data: response
            }
        }
        return res;
    } catch (error: any) {
        console.log(error);
        //for when the url does not contain any thing. if a url is passed
        if (error?.code === 'ERR_BAD_REQUEST') error.message = 'File not found. ensure the url exist';
        if(error.message.includes('duplicate key')) error.message = 'you already have a file with this name';
        Logger.error([error, error.stack, new Date().toJSON()], 'error uploading data');
        throwcustomError(error.message);
    }
}