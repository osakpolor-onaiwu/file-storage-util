import { jsonS, jsonErr } from '../utils/responses';
import s3Delete from '../utils/s3.delete';
import joi from 'joi';
import { validateSchema } from '../utils/validatespec';
import path from 'path';
import DownloadModel from '../models/download';
import { saveDownload } from '../dal/download';

const spec = joi.object({
    url: joi.string().uri(),
    file: joi.object(),
    raw_data: joi.string(),
    type: joi.any().valid('json', 'csv', 'pdf').required(),
    name: joi.string().trim(),
})

export default async function (req: any, res: any, next: any) {
    const message = 'Please provide either a file, url or raw data, but not more than one of them';
    try {
        if (req.file) req.body.file = req.file;
        const params = validateSchema(spec, req.body);
        const { file, url, type, raw_data } = params;

        if ((file && raw_data)
            || (file && url)
        ) {
            await s3Delete({ filename: file.key });
            throw new Error(`${message}`)
        }
        if (url && raw_data) {
            throw new Error(`${message}`)
        }


        if (file) {

            const file_extension = path.extname(file?.key?.toLowerCase());
            if (file_extension !== `.${type}`) {
                await s3Delete({ filename: file.key });
                throw new Error(`the type you provided is different from the extention of the file uploaded.`)
            }

            await saveDownload({
                file: file.originalname,
                url: file.location,
                // merchant_account_id: accountid,
            },
                DownloadModel)
        }

        return next()
    } catch (error: any) {
 
        jsonErr(res,error.message,null);
    }
}
