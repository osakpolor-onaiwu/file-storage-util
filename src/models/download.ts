import mongoose, { Schema, Document } from 'mongoose';
export interface Download extends Pick<Document, '_id'> {
  url?: string;
  accountid?: number;
  file?: string;
}

const DownloadSchema: Schema<Download> = new Schema(
  {
    url: {
      type: String,
      required: false,
    },

    accountid: {
      type: Number,
      required: false,
    },
    file: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const DownloadModel = mongoose.model('Download', DownloadSchema, 'download');

export default DownloadModel;