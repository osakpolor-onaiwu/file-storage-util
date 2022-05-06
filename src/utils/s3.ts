import { validateSchema } from '../utils/validatespec';
import AWS from 'aws-sdk';
import joi from 'joi';
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3BASE = process.env.AWS_S3BASE;

const spec = joi.object({
  data: joi.string().required(),
  filename: joi.string(),
})

export default async function s3(data: object) {
  try {
    const params = validateSchema(spec,data);
    AWS.config.update({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });

    let s3 = new AWS.S3();

    params.filename = params.filename || Date.now() + '_0_0_';
    let payload = {
      Bucket: 'filestorage-util',
      Key: params.filename,
      Body: params.data,
    };
    const upload = s3.putObject(payload).promise();
    const link = upload
      .then(() => {
        return s3BASE + params.filename;
      })
      .catch((err: object) => {
        throw err;
      });

    return link;
  } catch (error) {
    throw error;
  }
}
