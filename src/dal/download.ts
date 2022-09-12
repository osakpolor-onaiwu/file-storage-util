import DownloadModel, { Download } from '../models/download';
import { Document } from 'mongoose';
import { SearchType, optConfig} from '../types/db_search_types'

export async function saveDownload(data: Download, model: typeof DownloadModel): Promise<Document> {
    const new_download = new model(data);
    return new_download.save();
}

export async function findDownload(
    data: object,
    model: typeof DownloadModel,
    searchType: string,
    projection?: string | string[] | { [key: string]: number },
    options?: optConfig,
): Promise<Download> {
    let result: any = {};
    if (searchType === SearchType.ONE) {
        result = await model
            .findOne(data)
            .lean()
            .select(projection || '');
    } else {
        result = await model
        .find(data)
        .lean()
        .limit(options?.limit || 10)
        .skip(options?.skip || 0)
        .select(projection || '')
        .sort(options?.sort || 'createdAt');
    }
    return result;
}

export async function updateDownload(filter: object, data: Download, model: typeof DownloadModel): Promise<any> {
    return await model.findOneAndUpdate(filter, data, { new: true });
}

export async function deleteDownload(data: object, model: typeof DownloadModel): Promise<any> {
    return await model.findOneAndDelete(data);
}


export async function countDocument(data: object, model: any) {
    return await model.where(data).countDocuments();
}