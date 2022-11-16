import joi from 'joi';
import { validateSchema } from './validatespec';
import path from 'path';

const spec = joi.object({
    url: joi.string().uri(),
    raw_data: joi.string(),
    name: joi.string().trim(),
    type: joi.string().required(),
    from: joi.any().valid('json', 'csv','jpg', 'jpeg', 'png','pdf','html'),
    to: joi.any().valid('json', 'csv', 'jpg', 'jpeg', 'png','pdf'),
    paths: joi.string().required(),
    file: joi.object(),
  })
  
export default function (data:object) {
   
    const message = 'Please provide either a file, url or raw data, but not more than one of them at a time.';
    
    const allowed_mime_types = {
        doc_upload: ['text/csv', 'application/json', 'application/pdf'],
        doc_convert: ['text/csv', 'application/json', 'text/html'],
        image_upload: ['image/png','image/jpeg', 'image/bmp'],
        image_convert: ['image/png','image/jpeg']
    }
    const ext_type = {
        doc_upload:['json','csv','pdf'],
        doc_convert:['json','csv','html','com'],
        img_upload:['bmp','jpeg','jpg','png'],
        img_convert:['jpeg','png','jpg'],
    }
    try {
     
        const params = validateSchema(spec, data);   
        const { file, url, type, raw_data } = params;

        if ((file && raw_data)
            || (file && url)
        ) {
            throw new Error(`${message}`)
        }
        if (url && raw_data) {
            throw new Error(`${message}`)
        }

       
        if(params.from){
            let file_extension = path.extname(params.file.originalname.toLowerCase());
            if(file_extension === '.jpg') file_extension = '.jpeg'
            if(`.${params.from}` !== file_extension){
                throw new Error('the extension of the file must be the same as the from field.');
            }
        }

        if (file) {
            const file_extension = path.extname(file?.originalname?.toLowerCase());
            if ((file_extension !== `.${type}`)) {
                throw new Error(`the type you provided is different from the extention of the file uploaded.`);
            }
        }
        if (params.from === params.to) {
            throw new Error('from and to cannot be the same.');
        }

        switch (params.paths) {
            case '/docs/convert':
                if(!ext_type.doc_convert.includes(params.type) || !allowed_mime_types.doc_convert.includes(file.mimetype)) throw new Error(`only json, html and csv files are supported`);      
                break;

            case '/docs/upload':
                if(!ext_type.doc_upload.includes(params.type) || !allowed_mime_types.doc_upload.includes(file.mimetype)) throw new Error(`only json, pdf and csv files are supported`);
                break;

            case '/img/convert':
                //to do, move this to a function and avoid repeating in convertdoc service
                if(params.from === 'html' && (params.to !== 'pdf'&& params.to !== 'jpeg')) throw new Error('html can only be converted to pdf');
                if(params.from === 'text' && params.to !== 'pdf') throw new Error('text can only be converted to pdf');
                if(params.from === 'html' && (!params.url && !params.file)) throw new Error('please pass a url or file');
                if(params.to === 'jpeg' && params.from !== 'html') throw new Error('only html document can be converted to image');
                if(!ext_type.img_convert.includes(params.type) || !allowed_mime_types.image_convert.includes(file.mimetype)) throw new Error(`only jpeg and png files are supported`);
                
                break;

            case '/img/upload':
                if(!ext_type.img_upload.includes(params.type) || !allowed_mime_types.image_upload.includes(file.mimetype)) throw new Error(`only jpeg, png and svg files are supported`);
                break;
            default:
                break;
        }

        return {
            err:null
        }
    } catch (error: any) {
       return {
           err:`${error.message}`,
       };
    }
}
