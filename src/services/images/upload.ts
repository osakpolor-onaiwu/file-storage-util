import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import axios from "axios";
import s3 from '../../utils/s3';
import Logger from '../../utils/Logger'
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';


const spec = joi.object({
    url: joi.string().uri(),
    type: joi.any().valid('png', 'svg', 'jpeg').required(),
    name: joi.string().trim(),
    file: joi.object(),
})

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
                data: params?.file?.originalname,
            }
        }

        if (params.url) {

            if (!params.name) throw new Error('Please provide a file name for this url');
            file_extension = path.extname(params?.url?.toLowerCase());
            if (file_extension !== `.${params.type}`) {
                throw new Error('The extention of your file is different from the type you specified');
            }

            file_name = `${params.name}${file_extension}`;
            const get_file = await axios.get(params.url);
            if (!get_file) throw new Error('The file in the url could not be found');

            file = get_file?.data || get_file;
        }

        s3({ data: file, filename: file_name })
        .then(link => {
            saveDownload({
                file: file_name,
                url: link,
                // merchant_account_id: accountid,
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