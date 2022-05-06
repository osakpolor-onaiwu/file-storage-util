import { validateSchema } from '../utils/validatespec';
import AWS from 'aws-sdk';
import joi from 'joi';
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3BASE = process.env.AWS_S3BASE;
import multer from 'multer';
import multerS3 from 'multer-s3';

const spec = joi.object({
  data: joi.string().required(),
  filename: joi.string(),
})

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
});
let s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'filestorage-util',
      metadata: function (req?:any, file?:any, cb?:any) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req?:any, file?:any, cb?:any) {
        cb(null, Date.now().toString())
      }
    })
  }).single('file')

  export default upload