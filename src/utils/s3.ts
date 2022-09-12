import { validateSchema } from '../utils/validatespec';
import AWS from 'aws-sdk';
import joi from 'joi';
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3BASE = process.env.AWS_S3BASE;
import Logger from '../utils/Logger'

const spec = joi.object({
  data: joi.any().required(),
  filename: joi.string(),
})

export default async function s3(data: object,flag?:string) {

  try {
    const params = validateSchema(spec,data);
    if(flag && flag === 'json') params.data = JSON.stringify(params.data);
   
    AWS.config.update({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });

    let s3 = new AWS.S3();

    params.filename = params.filename || Date.now() + '_0_0_';
    let payload = {
      Bucket: 'filestorage-utility',
      Key: params.filename,
      Body: params.data,
      ACL:'public-read',
    };
    const upload = s3.putObject(payload).promise();
    //try switching to async
    const link = upload
      .then(() => {
        return s3BASE + params.filename;
      })
      .catch((err: object) => {
        throw err;
      });

    return link;
  } catch (error:any) {
    Logger.errorX([error, error.stack, new Date().toJSON()], 's3_error');
    throw error;
  }
}
