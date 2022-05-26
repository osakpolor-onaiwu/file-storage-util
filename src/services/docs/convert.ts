import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import axios from "axios";
import s3 from '../../utils/s3';
import s3Delete from '../../utils/s3.delete';
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';
import csvtojson from "csvtojson";
import jsonexport from "jsonexport";
import Logger from '../../utils/Logger';
import {parse} from 'flatted'

const spec = joi.object({
    url: joi.string().uri(),
    file: joi.object(),
    raw_data: joi.string(),
    name: joi.string().trim(),
    from: joi.any().valid('json', 'csv').required(),
    to: joi.any().valid('json', 'csv').required(),
    account_id: joi.string().trim().required(),
    options: joi.object({
        rowDelimiter: joi.string().trim(), // Change the file row delimiter, Defaults to , (cvs format). Use \t for xls format. Use ; for (windows excel .csv format).
        booleanTrueString: joi.string().trim(), //Will be used instead of true
        booleanFalseString: joi.string().trim(), //Will be used instead of false
        textDelimiter: joi.string(), //textDelimiter - String The character used to escape the text content if needed (default to ")
        includeHeaders: joi.boolean(), //Set this option to false to hide the CSV headers.
        undefinedString: joi.string(), // If you want to display a custom value for undefined strings, use this option. Defaults to .
        verticalOutput: joi.boolean().default(true)
    })
})


export async function convert(data: any) {
    let file_extension = null,
        file_name: string = '';
    let converted_to;
    let parse_data = null;
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

        if (params.url && params.raw_data) {
            throw new Error('Please provide either a file, url or raw data, but not more than one of them at a time.');
        }

        const options: object = {
            verticalOutput:  params?.options?.verticalOutput||false,
            includeHeaders: params?.options?.includeHeaders || true,
            ...params?.options
        }

        if (params.url) {
            file_extension = path.extname(params?.url?.toLowerCase());
            if (file_extension !== `.${params.from}`) {
                throw new Error('Ensure the extention of the url is same as the from field supplied');
            }

            const get_file: any = await axios.get(params.url);
            if (!get_file || !get_file.data) throw new Error('The file in the url could not be found');

            if (file_extension === '.csv' && params.from === 'csv') {
                file_name = `${Date.now()+params.name || Date.now()+'-file-storage-'}.${params.to}`;
                flag='json';
                
                converted_to = await csvtojson().fromString(get_file.data);
                if (!converted_to) throw new Error('error converting url from csv to json');

            } else {
                try {
                    parse_data = JSON.parse(JSON.stringify(get_file.data));;
                } catch (error) {
                    throw new Error('data could not be parsed to an object');
                }

                file_name = `${Date.now()+params.name || Date.now()+'-file-storage'}.${params.to}`;
                converted_to = await jsonexport(parse_data, options)
                if (!converted_to) throw new Error('error converting raw data from json to csv');
            }
        }

        if (params.raw_data) {
            if (params.from === 'csv') {
                flag = 'json';
                if(params.raw_data.includes('{') || params.raw_data.includes('}')) throw new Error('please provide a valid csv for the raw data')
                file_name = file_name = `${Date.now()+params.name || Date.now()+'-file-storage'}.${params.to}`;
                converted_to = await csvtojson().fromString(params.raw_data);
               
                if (!converted_to) throw new Error('error converting raw data from csv to json');
            } else {
                file_name = file_name = `${Date.now()+params.name || Date.now()+'-file-storage'}.${params.to}`;
                try {
                    parse_data = JSON.parse(String(params.raw_data));
                } catch (error) {
                    throw new Error('please pass a valid json');
                }
               
                converted_to = await jsonexport(parse_data, options)
                if (!converted_to) throw new Error('error converting raw data from json to csv');
            }
        }

        if (params.file) {
            file = params.file.key;
            file_extension = path.extname(params.file?.location.toLowerCase());
            const get_file: any = await axios.get(params.file?.location);
            
            if (!get_file || !get_file.data) throw new Error('The file in the url could not be found');

            if (file_extension === '.csv' && params.from === 'csv' && params.to === 'json') {
                flag = 'json';
                file_name = `${Date.now()+params.name || Date.now()+'-file-storage'}.${params.to}`;

                converted_to = await csvtojson().fromString(get_file.data);
                if (!converted_to) throw new Error('error converting url from csv to json');
           
            } else {
              
                try {
                    parse_data = JSON.parse(JSON.stringify(get_file.data));
                } catch (error) {
                    throw new Error('data could not be parsed to an object');
                }
                
                file_name = `${Date.now()+params.name || Date.now()+'-file-storage'}.${params.to}`;
                converted_to = await jsonexport(parse_data, options);
                if (!converted_to) throw new Error('error converting raw data from json to csv');
                   
            }

            await s3Delete({ filename: params.file?.key });
        }
  
        s3({ data: converted_to, filename: file_name },flag)
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
            message: "conversion successful",
            data:converted_to
        }

    } catch (error: any) {
        Logger.errorX([error, error.stack, new Date().toJSON()], 'DOC-CONVERSION-ERROR');
        throwcustomError(error.message);
    }
}