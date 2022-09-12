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
    name: joi.string().trim().required().error(new Error('Please provide a name')),
    file: joi.object(),
    account_id: joi.string().trim().required(),
})

const jimp = async (file:string,file_name:string)=>{
    try {
        
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
        let file_url = null;
        console.log(params);
        if(params.file){
            file_url = params?.file.location;
            saveDownload({
                file: params.name,
                url: params?.file.location,
                accountid: params.account_id,
                key: params.file.key,
                type:'image upload'
            },
                DownloadModel)
            return {
                message: "upload successful",
                data: {
                    file_name:params.name,
                    location:file_url,
                    original_name:params?.file?.originalname,
                },
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
            file_url = link;
            saveDownload({
                file: params.name,
                key:file_name,
                url: link,
                accountid: params.account_id,
                type:'image upload'
            },
                DownloadModel)
        }).catch(e => {
            throw new Error('error uploading data');
        })

        return {
            message: "upload successful",
            data: {
                file_name:params.name,
                location:file_url
            },
        }

    } catch (error: any) {
        //for when the url does not contain any thing. if a url is passed
        if(error?.code ==='ERR_BAD_REQUEST') error.message = 'File not found. ensure the url exist';
        Logger.errorX([error, error.stack, new Date().toJSON()], 'error uploading data');
        console.log('upload img err---',error)
        throwcustomError(error.message);
    }
}