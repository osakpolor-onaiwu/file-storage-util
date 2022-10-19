import { ObjectId } from 'mongodb';

export interface S3upload {
    file: string;
    filename: string;
    download_id: ObjectId;
}