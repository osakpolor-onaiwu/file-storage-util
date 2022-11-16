import s3 from '../utils/s3';
import Logger from '../utils/Logger'
import DownloadModel from '../models/download';
import QueueModel, { Queue } from '../models/queue';
import { findDownload, updateDownload } from '../dal/download';
import { findQueueItem, updateQueueItem } from './dal';
import { S3upload } from './interface';
import { initiateMongodb } from '../config/mongo';

(async () => {
    await initiateMongodb()
  
    // let queue_item: [{ [key: string]: any }];
    try {
        //find fifteen items with status of new
        const queue_item = await findQueueItem({
            status: 'new',
            run_on: { $lte: Date.now() },
            job: 'uploaddoc',
        },
            QueueModel,
            'all',
            undefined,
            { limit: 10 }
        )

        if (!queue_item.length) throw new Error('no queue item found');
        //for each item upload them
        for (const item of queue_item) {
            await updateQueueItem({ _id: item._id }, { status: 'pending' }, QueueModel);
            let params: S3upload;
            params = item.data;
            const download_exist = await findDownload({ _id: params.download_id }, DownloadModel, 'one');
            if (!download_exist) throw new Error('download item not found');
      
            const upload = await s3({ data: params.file, filename: params.filename })

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
        console.log('upload doc error---', error);
        if(error.message !== 'no queue item found') Logger.error([error, error.stack, new Date().toJSON()], 'error converting data');
        process.exit(0);
    }

})()

