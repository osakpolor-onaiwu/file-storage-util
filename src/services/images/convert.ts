import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import fs from 'fs';
import s3Delete from '../../utils/s3.delete';
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';
import Jimp from 'jimp';
import Logger from '../../utils/Logger';


const spec = joi.object({
    url: joi.string().uri(),
    name: joi.string().trim(),
    from: joi.any().valid('jpeg', 'png').required(),
    to: joi.any().valid('jpeg', 'png').required(),
    file: joi.object(),
  
})

const jimp = async (file:string,file_name:string)=>{
    try {
        const image = await Jimp.read(file);
        return image.write(file_name);
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
        if (params.from === params.to) {
            throw new Error('from and to cannot be the same.');
        }

        if (params.url) {
            file_extension = path.extname(params?.url?.toLowerCase());
            if (file_extension !== `.${params.from}`) {
                throw new Error('Ensure the extention of the url is same as the from field supplied');
            }

            if (file_extension === '.jpeg' && params.from === 'jpeg') {
                file_name = `${params.name || new Date() + '-file-storage-'}.png`;         
                converted_to = await jimp(params.url, file_name);
              
            } else {
                file_name = `${params.name || new Date() + '-file-storage-'}.jpeg`;
                converted_to = await jimp(params.url, file_name);
            }
        }


        if (params.file) {
            const key = params.file.key;
            file_extension = path.extname(params.file?.location.toLowerCase());
           
            if (file_extension === '.jpeg' && params.from === 'jpeg' && params.to === 'jpeg') {
                file_name = `${params.name || key}.png`;
                converted_to = await jimp(params.file.location, file_name)
            } else {
                file_name = `${params.name || key}.jpeg`;
                converted_to = await jimp(params.file.location, file_name)
            }

            await s3Delete({ filename: key });
        }
        fs.writeFile(file_name, converted_to, (err) => {
            if (err)
              console.log('img conv err---',err);
            else {
              console.log("File written successfully\n");
            }
          });
        return {
            message: "conversion successful",
            data:converted_to
        }
    } catch (error:any) {
        console.log('CONV-ERR---',error);
        Logger.errorX([error, error.stack, new Date().toJSON()], 'IMG-CONVERSION-ERR');
        throwcustomError(error.message);
    }
}