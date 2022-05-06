import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import axios from "axios";
import s3 from '../../utils/s3';
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';


const spec = joi.object({
    url: joi.string().uri(),
    file: joi.object(),
    raw_data: joi.string(),
    type: joi.any().valid('json', 'csv', 'pdf').required(),
    name: joi.string().trim(),
})


export async function upload(data: any) {
    try {
        const params = validateSchema(spec, data);
        // console.log('params---', params)

        let file_extension = null,
            file_mime_type = null,
            file_path = null,
            file_name: string = '',
            file = null;

        if (!params.url && !params.file && !params.raw_data) {
            throw new Error('please provide either a file, url or raw data');
        }

        if ((params.file && params.raw_data)
            || (params.file && params.url)
            || (params.url && params.raw_data)) {
            throw new Error('Please provide either a file, url or raw data, but not more than one of them');
        }

        if (params.file) {
            file_extension = path.extname(params?.file?.originalname.toLowerCase());
            file_mime_type = params?.file?.mimetype;
            file_path = params?.file?.path;

            if (`.${params.type}` !== file_extension) {
                throw new Error('The extention of your file is different from the type you specified');
            }
            file_name = params?.file?.originalname || `${params.name}.${file_extension}`;
            // console.log(params.file)
            file = params.file.path;
            console.log('file name---', { file, file_name });
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

        if (params.raw_data) {
            if (!params.name) throw new Error('Please provide a name for this raw data');
            file_name = `${params.name}.${params.type}`;

            if (params.type === 'pdf') throw new Error(`raw data can't be pdf, only json and csv are accepted.`);
            console.log(params.raw_data);
            let parse_json;
            try {
                parse_json = JSON.parse(params.raw_data);
            } catch (error) {
                // throw new Error(`error passing data, Please ensure it's a valid json`)
            }

            
            if (typeof parse_json === 'object') {
                if (params.type === 'csv' || params.type === 'pdf') throw new Error(`The raw data is a json, you can't provide csv or pdf as the type`);
                file = params.raw_data;
            } else {
                if (params.type === 'json' || params.type === 'pdf') throw new Error(`The raw data is a csv, you can't provide json or pdf as the type`);
                if (!`${params.raw_data}`.includes(',')) throw new Error(`please provide a delimiter for your csv i.e ,`);
                file = params.raw_data;
            }
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
                saveDownload({
                    file: file_name,
                    url: 'file not uploaded',
                    // merchant_account_id: accountid,
                },
                    DownloadModel
                )
            })

        return {
            message: "upload successful",
            data: file_name,
        }
    } catch (error: any) {
        console.log("error", error);
        throwcustomError(error.message);
    }
}