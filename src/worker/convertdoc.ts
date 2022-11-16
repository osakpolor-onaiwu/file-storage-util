import s3 from '../utils/s3';
import Logger from '../utils/Logger'
import DownloadModel from '../models/download';
import QueueModel, { Queue } from '../models/queue';
import { findDownload, updateDownload } from '../dal/download';
import { findQueueItem, updateQueueItem } from './dal';
import { S3upload } from './interface';
import { initiateMongodb } from '../config/mongo';
import csvtojson from "csvtojson";
import puppeteer from 'puppeteer';
import jsonexport from "jsonexport";

(async () => {
    await initiateMongodb()

    try {
        const queue_item = await findQueueItem({
            status: 'new',
            run_on: { $lte: Date.now() },
            job: 'convertdoc',
        },
            QueueModel,
            'all',
            undefined,
            { limit: 10 }
        )

        if (!queue_item.length) throw new Error('no queue item found');
        //for each item upload them
        for (const item of queue_item) {
            let flag; 
            let converted;
            await updateQueueItem({ _id: item._id }, { status: 'pending' }, QueueModel);
            let params: S3upload;
            params = item.data;
            
            const download_exist = await findDownload({ _id: params.download_id }, DownloadModel, 'one');
            if (!download_exist) throw new Error('download item not found');

            if (params.from === 'csv') {
                flag = 'json';
                
                converted = await csvtojson().fromString(params.data_to_convert);
                if (!converted) throw new Error('error converting data from csv to json');
        
            } else if (params.from === 'html'){
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(params.data_to_convert);
                if(params.to === 'pdf'){
                    //returns a buffer of the page send the buffer to s3
                    converted = await page.pdf({ format: params?.options?.pdfFormat || 'A4' });
                }else{
                    converted = await page.screenshot({
                        type:'jpeg',
                        quality:params.options?.quality,
                        fullPage:params.options?.fullPage,
                    });
                }
               
                if(!converted) throw new Error('error converting data from html to pdf');
		        await browser.close();
            }
            else {
                flag = 'csv';
                converted = await jsonexport(params.data_to_convert, params.options);
                if (!converted) throw new Error('error converting data from json to csv');
            }

            const upload = await s3({ data: converted, filename: params.filename }, flag);

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
        if(error.message !== 'no queue item found') Logger.error([error, error.stack, new Date().toJSON()], 'error converting data');
        process.exit(0);
    }

})()

