import { validateSchema } from '../utils/validatespec';
import throwcustomError from '../utils/customerror'
import joi from 'joi';
import path from 'path';
import axios from "axios";
import s3 from '../utils/s3';
import Logger from '../utils/Logger'
import DownloadModel from '../models/download';
import QueueModel, { Queue } from '../models/queue';
import { findDownload, updateDownload } from '../dal/download';
import { findQueueItem, updateQueueItem } from './dal';
import { S3upload } from './interface';
import { initiateMongodb } from '../config/mongo';

import Jimp from 'jimp';

const jimp = async (file: string, file_name: string) => {
    try {

        const image = await Jimp.read(file);

        if (file_name.includes('png')) {
            return image.getBufferAsync(Jimp.MIME_PNG);
        } else if (file_name.includes('bmp')) {
            image.getBufferAsync(Jimp.MIME_BMP);
        }
        else {
            return image.getBufferAsync(Jimp.MIME_JPEG);
        }

    } catch (err) {
        throw (err);
    }
}

(async () => {
    await initiateMongodb()
    // let queue_item: [{ [key: string]: any }];
    try {
        //find fifteen items with status of new
        const queue_item = await findQueueItem({
            status: 'new',
            run_on: { $lte: Date.now() },
            job: 'uploadimg',
        },
            QueueModel,
            'all',
            undefined,
            { limit: 10 }
        )

        if (!queue_item.length) throw new Error('no queue item found');
        
        for (const item of queue_item) {
            await updateQueueItem({ _id: item._id }, { status: 'pending' }, QueueModel);
            let params: S3upload;
            params = item.data;
            const download_exist = await findDownload({ _id: params.download_id }, DownloadModel, 'one');
            if (!download_exist) throw new Error('download item not found');
            const file = await jimp(params.file, params.filename);
            const upload = await s3({ data: file, filename: params.filename })

            if (upload.message === 'success') {
                await updateDownload({ _id: params?.download_id, }, { url: upload.data }, DownloadModel);
                await updateQueueItem({ _id: item._id }, { status: 'completed', complete_message: 'upload completed successfully' }, QueueModel);
                continue;
            } else {
                await updateDownload({ _id: params?.download_id, }, { url: null }, DownloadModel);
                await updateQueueItem({ _id: item._id }, { status: 'failed', complete_message: upload.data }, QueueModel);
                throw new Error(upload.data)
            }
        }

        // return true;
        process.exit(0);
    } catch (error: any) {
        console.log('upload img error---', error);
        if(error.message !== 'no queue item found') Logger.error([error, error.stack, new Date().toJSON()], 'error converting data');
        process.exit(0);
    }

})()

