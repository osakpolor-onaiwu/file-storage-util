import s3 from '../utils/s3';
import Logger from '../utils/Logger'
import DownloadModel from '../models/download';
import QueueModel, { Queue } from '../models/queue';
import { findDownload, updateDownload } from '../dal/download';
import { findQueueItem, updateQueueItem } from './dal';
import { S3upload } from './interface';
import {initiateMongodb} from '../config/mongo';
import { parentPort } from 'worker_threads'


initiateMongodb()

const upload = async () => {
    console.log('upload job started -------')
        let isCancelled = false;
        if (parentPort) {
            parentPort.once("message", (message) => {
            if (message === "cancel") isCancelled = true;
        });
    }
    // let queue_item: [{ [key: string]: any }];
    try {
        //find fifteen items with status of new
        if (isCancelled) return;
        const queue_item = await findQueueItem({
            status: 'new',
            run_on: { $lte: Date.now() },
            job: 'convert',
        },
            QueueModel,
            'all',
            undefined,
            { limit: 20 }
        )
        
        if (!queue_item.length) throw new Error('no queue item found');

        //for each item upload them
        await queue_item.forEach(async(item:any) =>{
            await updateQueueItem({ _id: item._id }, { status: 'pending' }, QueueModel);
            let params: S3upload;
           
            params = item.data;
            const download_exist = await findDownload({ _id: params.download_id }, DownloadModel, 'one');
            if (!download_exist) throw new Error('download item not found');

            s3({ data: params.file, filename: params.filename })
                .then(async upload => {
                    console.log('upload data-----', upload)
                    if (upload.message === 'success') {
                        updateDownload({ _id: params?.download_id, }, { url: upload.data }, DownloadModel);
                        updateQueueItem({ _id: item._id }, { status: 'completed', complete_message: 'upload completed successfully' }, QueueModel);
                    } else {
                        updateDownload({ _id: params?.download_id, }, { url: null }, DownloadModel);
                        updateQueueItem({ _id: item._id }, { status: 'failed', complete_message: upload.data }, QueueModel);
                    }
                })
        })
        if (parentPort) parentPort.postMessage("done");
        else process.exit(0);
        return true;
        
    } catch (error: any) {
        console.log('upload worker error---',error);
        Logger.errorX([error, error.stack, new Date().toJSON()], 'error uploading data');
        if (parentPort) parentPort.postMessage("done");
        else process.exit(0);
    }
    
}

upload();
module.exports = upload;
