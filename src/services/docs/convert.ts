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
    raw_data: joi.string(),
    name: joi.string().trim().required().error(new Error('Please provide a name')),
    from: joi.any().valid('json', 'csv','html').required(),
    to: joi.any().valid('json', 'csv','pdf','jpeg').required(),
    file_description:joi.string().trim().optional(),
    account_id: joi.string().trim().required(),
    options: joi.object({
        rowDelimiter: joi.string().trim(), // Change the file row delimiter, Defaults to , (cvs format). Use \t for xls format. Use ; for (windows excel .csv format).
        booleanTrueString: joi.string().trim(), //Will be used instead of true
        booleanFalseString: joi.string().trim(), //Will be used instead of false
        textDelimiter: joi.string(), //textDelimiter - String The character used to escape the text content if needed (default to ")
        includeHeaders: joi.boolean(), //Set this option to false to hide the CSV headers.
        undefinedString: joi.string(), // If you want to display a custom value for undefined strings, use this option. Defaults to .
        verticalOutput: joi.boolean().default(true),
        pdfFormat:joi.any().valid('A4','letter'),//page size of pdf file when converting html
        fullPage:joi.boolean().default(true),
        quality:joi.number().default(100)
    })
})


export async function convert(data: any) {

    let file_extension = null,
        file_name: string = '';
    let converted;
    let data_to_convert;
    let parsed_data = null;
    let file;
    let flag;
    
    try {
        if (data.options) {
            try {
                data.options = JSON.parse(data?.options);
            } catch (error) {
                throw new Error('provide a valid json object')
            }
        }

        const params = validateSchema(spec, data);
        // console.log(params);

        if (!params.url && !params.file && !params.raw_data) throw new Error('please provide either a url, raw_data or a file');
        if (params.from === params.to) {
            throw new Error('from and to cannot be the same.');
        }
        if(params.from === 'html' && (params.to !== 'pdf'&& params.to !== 'jpeg')) throw new Error('html can only be converted to pdf');
        if(params.from === 'text' && params.to !== 'pdf') throw new Error('text can only be converted to pdf');
        if(params.from === 'html' && (!params.url && !params.file)) throw new Error('please pass a url or file');
        if(params.to === 'jpeg' && params.from !== 'html') throw new Error('only html document can be converted to image')
        if (params.url && params.raw_data) {
            throw new Error('Please provide either a file, url or raw data, but not more than one of them at a time.');
        }

        const options: object = {
            verticalOutput:  params?.options?.verticalOutput||false,
            includeHeaders: params?.options?.includeHeaders || true,
            fullPage:params?.options?.fullPage || true,
            quality:params?.options?.quality,
            ...params?.options
        }

        if (params.url) {
            file_extension = path.extname(params?.url?.toLowerCase());
            //ignore the rule if file is an html
            if (params.from !== 'html' && (file_extension !== `.${params.from}`)) {
                throw new Error('Ensure the extention of the url is same as the from field supplied');
            }

            const get_file: any = await axios.get(params.url);
            if (!get_file || !get_file.data) throw new Error('The file in the url could not be found');

            if (file_extension === '.csv' && params.from === 'csv') {
                file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
                flag='json';
    
                data_to_convert = get_file.data;
            }else if(params.from === 'html'){
                data_to_convert = params.url;
                flag = 'html';
                file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
            } else {
                try {
                    parsed_data = JSON.parse(JSON.stringify(get_file.data));
                } catch (error) {
                    throw new Error('data could not be parsed to an object');
                }

                file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
                data_to_convert = parsed_data;
            }
        }

        if (params.raw_data) {
            if (params.from === 'csv') {
                flag = 'json';
                if(params.raw_data.includes('{') || params.raw_data.includes('}')) throw new Error('please provide a valid csv for the raw data')
                file_name = file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
                
                data_to_convert = params.raw_data;
            } else {
                file_name = file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
                try {
                    parsed_data = JSON.parse(String(params.raw_data));
                } catch (error) {
                    throw new Error('please pass a valid json');
                }
               
                data_to_convert = parsed_data;
            }
        }

        if (params.file) {
            file = params.file.key;
            file_extension = path.extname(params.file?.location.toLowerCase());
            const get_file: any = await axios.get(params.file?.location);
            
            if (!get_file || !get_file.data) throw new Error('The file in the url could not be found');

            if (file_extension === '.csv' && params.from === 'csv' && params.to === 'json') {
                flag = 'json';
                file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
                data_to_convert = get_file.data;
            }else if(params.from === 'html'){
                data_to_convert = params.file?.location;
                flag = 'html';
                file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
            } else {
              
                try {
                    parsed_data = JSON.parse(JSON.stringify(get_file.data));
                } catch (error) {
                    throw new Error('data could not be parsed to an object');
                }
                
                file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.to}`;
                data_to_convert = parsed_data;
            }

            await s3Delete({ filename: params.file?.key });
        }
  
        const response = await saveDownload({
            file: params.name,
            key:file_name,
            url: 'N/A',
            accountid: params.account_id,
            type:'document conversion'
        },
            DownloadModel)

      
        saveQueueItem({
            data:{ file_extension, options, from:params.from, to:params.to, data_to_convert, filename:file_name, download_id: response._id},
            run_on:new Date(),
            status:'new',
            job:'convertdoc'

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