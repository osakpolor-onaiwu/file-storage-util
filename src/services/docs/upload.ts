import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import path from 'path';
import axios from "axios";
import Logger from '../../utils/Logger'
import DownloadModel from '../../models/download';
import { saveDownload } from '../../dal/download';
import QueueModel, { Queue } from '../../models/queue';
import {saveQueueItem} from '../../worker/dal';
import { service_return } from '../../interface/service_response'


const spec = joi.object({
    url: joi.string().uri(),
    raw_data: joi.string(),
    type: joi.any().valid('json', 'csv', 'pdf').required(),
    name: joi.string().trim().required().error(new Error('Please provide a name')),
    file: joi.object(),
    file_description:joi.string().trim().optional(),
    account_id: joi.string().trim().required(),
})

export async function upload(data: any) {
    let file_extension = null,
    file_name: string = '',
    file = null;
    
    try {
        const params = validateSchema(spec, data);
        if((!params.url && !params.file && !params.raw_data)
        || (params.url && params.raw_data)
        ) throw new Error('please provide either a url, raw_data or a file, but not more than one at a time.');
       
        if(params.file){
            file_extension = path.extname(params.file.key.toLowerCase());
            file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}${file_extension}`.split(' ').join('');
            saveDownload({
                file: params.name,
                url: params?.file.location,
                key: params.file.key,
                accountid: params.account_id,
                type:'document upload'
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

            file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}${file_extension}`.split(' ').join('');
            const get_file = await axios.get(params.url);
            if (!get_file || !get_file?.data) throw new Error('The file in the url could not be found');

            if(file_extension.includes('json')){
                file = JSON.stringify(get_file?.data)
            }else{
                file = get_file?.data || get_file;
            }
            
        }

        if (params.raw_data) {
            file_name = `${params.name + '_' + Date.now() + '_' + params.account_id}.${params.type}`.split(' ').join('');
          
            if (params.type === 'pdf') throw new Error(`raw data can't be pdf, only json and csv are accepted.`);
         
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
  
            const response = await saveDownload({
                file: params.name,
                key:file_name,
                url: 'N/A',
                accountid: params.account_id,
                type:'document upload'
            }, DownloadModel)

            saveQueueItem({
                data:{ file, filename: file_name, download_id: response._id},
                run_on:new Date(),
                status:'new',
                job:'uploaddoc'

            },QueueModel)

        const res: service_return ={
            message: "upload in progress",
            data: response,
        }

        return res;
    } catch (error: any) {
        if(error?.code ==='ERR_BAD_REQUEST') error.message = 'File not found. ensure the url exist';
        if(error.message.includes('duplicate key')) error.message = 'you already have a file with this name';
        Logger.error([error, error.stack, new Date().toJSON()], 'DOC-UPLOAD-ERROR');
        
        throwcustomError(error.message);
    }
}