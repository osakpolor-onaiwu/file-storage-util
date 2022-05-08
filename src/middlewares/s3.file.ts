import { validateSchema } from '../utils/validatespec';
import AWS from 'aws-sdk';
import joi from 'joi';
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3BASE = process.env.AWS_S3BASE;
import multer from 'multer';
import multerS3 from 'multer-s3';
import moment from 'moment';

const spec = joi.object({
  data: joi.string().required(),
  filename: joi.string(),
})


let s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});


const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'file-storage-util',
      acl: 'public-read',
      metadata: function (req?:any, file?:any, cb?:any) {
        cb(null, {fieldName: file.fieldname});
      },

      key: function (req?:any, file?:any, cb?:any) {
        cb(null, `${moment(new Date()).format('DD MM YYYY hh:mm:ss') }-${file.originalname}`)
      }
    })
  }).single('file')
  export default upload