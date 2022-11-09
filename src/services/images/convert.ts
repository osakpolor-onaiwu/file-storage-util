import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import s3Delete from '../../utils/s3.delete';
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';
import Logger from '../../utils/Logger';
import { service_return } from '../../interface/service_response';
import QueueModel, { Queue } from '../../models/queue';
import { saveQueueItem } from '../../worker/dal';

const spec = joi.object({
    url: joi.string().uri(),
    name: joi.string().trim().required().error(new Error('please provide a name')),
    from: joi.any().valid('jpeg', 'png','jpg').required(),
    to: joi.any().valid('jpeg', 'png','jpg').required(),
    file: joi.object(),
    file_description:joi.string().trim().optional(),
    account_id: joi.string().trim().required(),
})



export async function convert(data: any) {
    let file_extension = null;
    let file_name: string = '';
    let data_to_convert;

    try {
        const params = validateSchema(spec, data);
        // console.log(params);
        if (params.from === params.to) {
            throw new Error('from and to cannot be the same.');
        }
        if(
            ( params.from === 'jpeg' && params.to === 'jpg') 
            || (params.from === 'jpg' && params.to === 'jpeg')){
                throw new Error('from and to cannot be the same. jpeg is same as jpg')
            }

        if (params.url) {
            file_extension = path.extname(params?.url?.toLowerCase());
            if (file_extension !== `.${params.from}`) {
                throw new Error('Ensure the extention of the url is same as the from field supplied');
            }

            if ((file_extension === '.jpeg' || file_extension === '.jpg') && (params.from === 'jpeg' || params.from === 'jpg')) {
                file_name = `${Date.now()+params.name}.png`; 
                data_to_convert = params.url;        
                // converted_to = await jimp(params.url, file_name);
              
            } else {
                if(params.from === 'jpg'){
                    file_name = `${Date.now()+params.name}.jpg`;
                }else{
                    file_name = `${Date.now()+params.name}.jpeg`;
                }
                data_to_convert = params.url;    
                // converted_to = await jimp(params.url, file_name);
            }
        }

        if (params.file) {
            const key = `${params.file.key}`.split('.')[0];
            file_extension = path.extname(params.file?.location.toLowerCase());
           
            if ( (params.from === 'jpeg' || params.from === 'jpg') && params.to === 'png') {
                file_name = `${Date.now()+params.name || key}.png`;
                data_to_convert = params.file.location;
                // converted_to = await jimp(params.file.location, file_name)
            } else {
                file_name = `${Date.now()+params.name || key}.jpeg`;
                data_to_convert = params.file.location;
                // converted_to = await jimp(params.file.location, file_name)
            }

            await s3Delete({ filename: key });
        }


        const response = await saveDownload({
            file: params.name,
            key:file_name,
            url: 'N/A',
            accountid: params.account_id,
            type:'image conversion'
        },
            DownloadModel)

        // s3({ data: converted_to, filename: file_name })
        // .then(link => {
        //     saveDownload({
        //         file: params.name,
        //         key:file_name,
        //         url: String(link),
        //         accountid: params.account_id,
        //         type:'image conversion'
        //     },
        //         DownloadModel)
        // }).catch(e => {
        //     throw new Error('error uploading data');
        // })
        
        saveQueueItem({
            data:{ file_extension, from:params.from, to:params.to, data_to_convert, filename:file_name, download_id: response._id},
            run_on:new Date(),
            status:'new',
            job:'convertimg'

        },QueueModel)

        const res: service_return= {
            message: "conversion in progress",
            data: response
        }
        return res
    } catch (error:any) {
        // console.log('CONV-ERR---',error);
        Logger.error([error, error.stack, new Date().toJSON()], 'IMG-CONVERSION-ERR');
        throwcustomError(error.message);
    }
}