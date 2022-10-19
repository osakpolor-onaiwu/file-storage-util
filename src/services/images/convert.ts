import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import s3Delete from '../../utils/s3.delete';
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';
import s3 from '../../utils/s3';
import Jimp from 'jimp';
import Logger from '../../utils/Logger';
import { service_return } from '../../interface/service_response'

const spec = joi.object({
    url: joi.string().uri(),
    name: joi.string().trim().required().error(new Error('please provide a name')),
    from: joi.any().valid('jpeg', 'png','jpg').required(),
    to: joi.any().valid('jpeg', 'png','jpg').required(),
    file: joi.object(),
    file_description:joi.string().trim().optional(),
    account_id: joi.string().trim().required(),
})

const jimp = async (file:string,file_name:string)=>{
    try {
        const image = await Jimp.read(file);   
        file_name = file_name.slice(-3);

        if(file_name.includes('png')){
            
            return image.getBufferAsync(Jimp.MIME_PNG);
        }else{
            return image.getBufferAsync(Jimp.MIME_JPEG);
        }
   
    } catch (err) {
        throw (err);
    }
}

export async function convert(data: any) {
    let file_extension = null;
    let converted_to: string | any = null;
    let file_name: string = '';


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
                converted_to = await jimp(params.url, file_name);
              
            } else {
                if(params.from === 'jpg'){
                    file_name = `${Date.now()+params.name}.jpg`;
                }else{
                    file_name = `${Date.now()+params.name}.jpeg`;
                }
                
                converted_to = await jimp(params.url, file_name);
            }
        }

        if (params.file) {
            const key = `${params.file.key}`.split('.')[0];
            file_extension = path.extname(params.file?.location.toLowerCase());
           
            if ( (params.from === 'jpeg' || params.from === 'jpg') && params.to === 'png') {
                file_name = `${Date.now()+params.name || key}.png`;
                converted_to = await jimp(params.file.location, file_name)
            } else {
                file_name = `${Date.now()+params.name || key}.jpeg`;
                converted_to = await jimp(params.file.location, file_name)
            }

            
            await s3Delete({ filename: key });
        }

        s3({ data: converted_to, filename: file_name })
        .then(link => {
            saveDownload({
                file: params.name,
                key:file_name,
                url: String(link),
                accountid: params.account_id,
                type:'image conversion'
            },
                DownloadModel)
        }).catch(e => {
            throw new Error('error uploading data');
        })
        
        const res: service_return= {
            message: "conversion successful",
            data: file_name
        }
        return res
    } catch (error:any) {
        // console.log('CONV-ERR---',error);
        Logger.error([error, error.stack, new Date().toJSON()], 'IMG-CONVERSION-ERR');
        throwcustomError(error.message);
    }
}