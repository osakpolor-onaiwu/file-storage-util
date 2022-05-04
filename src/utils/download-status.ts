
import DownloadModel, { Download } from '../models/download';
import Logger from '../utils/Logger';
import { validateSchema } from './validatespec';
import joi from 'joi';
import { findDownload } from '../dal/download';

const spec = joi.object({
  file: joi.string().required(),
  AccountId: joi.string()
})


export async function download(data: Download) {
  try {
    const params = validateSchema(spec, data);

    const download = await findDownload(
      {
        file: params?.file,
      },
      DownloadModel,
      'one',
    );

    if (!download) throw new Error('download not found');

    const resp = {
      file: params.file,
      url: 'N/A',
      status: 'downloading',
    };

    if (download) {
      resp.url = 'n/a';
      resp.status = 'download-failed';
      if (download.url && download.url.includes('http')) {
        resp.url = download.url;
        resp.status = 'download-complete';
      }

      if (download.url && download.url === 'large_download') {
        resp.url = download.url;
        resp.status = 'download-pending';
      }
    }

    return {
      message: "download success",
      data: resp
    }
  } catch (error: any) {
    Logger.errorX(
      [error && error.message, error && error.stack, 'FETCH-DOWNLOAD-ERROR'],
      'FETCH-DOWNLOAD-ERROR',
    );
    throw error;
  }
}
