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
          
        }

        // return true;
        process.exit(0);
    } catch (error: any) {
        console.log('upload worker error---', error);
        Logger.error([error, error.stack, new Date().toJSON()], 'error uploading data');
        process.exit(0);
    }

})()

