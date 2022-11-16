import mongoose, { Schema, Document } from 'mongoose';
export interface Action extends Pick<Document, '_id'> {
  upload?: number;
  conversion?: number;
  accountid: string;
  month?: Date;
}
const ActionSchema: Schema<Action> = new Schema(
  {
    upload: {
      type: Number,
      required: false,
      default: 0,
    },
    conversion: {
        type: Number,
        required: false,
        default: 0,
    },
    month: {
        type: Date,
        required: true,
    },
    accountid: {
      type: String,
      required: false,
      index:true,
    },
  },
  { timestamps: true },
);

ActionSchema.index({ account_id: 1, file: 1 }, { unique: true })
const ActionModel = mongoose.model('Action', ActionSchema, 'action');

export default ActionModel;
