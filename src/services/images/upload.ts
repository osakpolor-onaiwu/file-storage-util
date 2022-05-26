import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import axios from "axios";
import s3 from '../../utils/s3';
import Logger from '../../utils/Logger'
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';
import Jimp from 'jimp';


const spec = joi.object({
    url: joi.string().uri(),
    type: joi.any().valid('png', 'bmp', 'jpeg','jpg').required(),
    name: joi.string().trim(),
    file: joi.object(),
    account_id: joi.string().trim().required(),
})

const jimp = async (file:string,file_name:string)=>{
    try {
        console.log('---***',file_name)
        const image = await Jimp.read(file);   

        if(file_name.includes('png')){
            return image.getBufferAsync(Jimp.MIME_PNG);
        }else if(file_name.includes('bmp')){
            image.getBufferAsync(Jimp.MIME_BMP);
        }
        else{
            return image.getBufferAsync(Jimp.MIME_JPEG);
        }
   
    } catch (err) {
        throw (err);
    }
}

export async function upload(data: any) {
    let file_name: string = '';
    let file_extension = null;
    let file = null;
    try {

        const params = validateSchema(spec, data);

        if(params.file){
            saveDownload({
                file: params.file.key,
                url: params?.file.location,
                // merchant_account_id: accountid,
            },
                DownloadModel)
            return {
                message: "upload successful",
                data: params.file.key,
            }
        }

        if (params.url) {

            if (!params.name) throw new Error('Please provide a file name for this url');
            file_extension = path.extname(params?.url?.toLowerCase());
            if (file_extension !== `.${params.type}`) {
                throw new Error('The extention of your file is different from the type you specified');
            }

            file_name = `${Date.now()+'-'+params.name}${file_extension}`;
           

            file = await jimp(params.url, file_name);;
        }

        s3({ data: file, filename: file_name })
        .then(link => {
            saveDownload({
                file: file_name,
                url: link,
                accountid: params.account_id,
            },
                DownloadModel)
        }).catch(e => {
            throw new Error('error uploading data');
        })

        return {
            message: "upload successful",
            data: file_name,
        }

    } catch (error: any) {
        Logger.errorX([error, error.stack, new Date().toJSON()], 'error uploading data');
        console.log("error---", error);
        throwcustomError(error.message);
    }
}