import AWS from 'aws-sdk';
import handlevalidation from '../utils/handlevalidation';
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3BASE = process.env.AWS_S3BASE;
import multer from 'multer';
import multerS3 from 'multer-s3';
import moment from 'moment';
import { jsonErr } from '../utils/responses';



let s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'filestorage-utility',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req?: any, file?: any, cb?: any) {
      cb(null, { fieldName: file.fieldname });
    },

    key: function (req?: any, file?: any, cb?: any) {
      // console.log('lea----',file)
      if (file) req.body.file = file;
      req.body.paths = req.originalUrl
      const validate = handlevalidation(req.body);
      if (validate.err) {
        cb(new Error(validate.err));
      }
      cb(null, `${moment(new Date()).format('DD MM YYYY hh:mm:ss')}-${file.originalname}`);
    }
  })
})

const uploadfile = upload.single('file');

export default function fileupload(req: any, res: any, next: any) {
  console.log("bod: ",req.query);
  uploadfile(req, res, function (err) {
    if (err) {
      console.log(err);
      if (`${err?.message}`?.includes('Inaccessible host')) err.message = 'error uploading file to host'
      jsonErr(res, err.message, null);
    } else {
      next()
    }
  })
}


// file: {
//   fieldname: 'file',
//   originalname: 'addresses.csv',
//   encoding: '7bit',
//   mimetype: 'text/csv'
// }
