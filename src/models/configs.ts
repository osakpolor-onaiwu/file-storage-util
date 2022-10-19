import mongoose, { Schema, Document } from 'mongoose';

export interface Config extends Pick<Document, '_id'> {
  key: string;
  data: string;
}

const ConfigLiteSchema: Schema<Config> = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    data: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const ConfigModel = mongoose.model('Config', ConfigLiteSchema, 'configlite');

export default ConfigModel;
