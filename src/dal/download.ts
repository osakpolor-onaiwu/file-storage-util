import DownloadModel, { Download } from '../models/download';
import { Document } from 'mongoose';
import { SearchType} from '../types/db_search_types'

export async function saveDownload(data: Download, model: typeof DownloadModel): Promise<Document> {
    const new_download = new model(data);
    return new_download.save();
}

export async function findDownload(
    data: object,
    model: typeof DownloadModel,
    searchType: string,
    projection?: string | string[] | { [key: string]: number },
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
            .select(projection || '');
    }
    return result;
}

export async function updateDownload(filter: object, data: Download, model: typeof DownloadModel): Promise<any> {
    return await model.findOneAndUpdate(filter, data, { new: true });
}