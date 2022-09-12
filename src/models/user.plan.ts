import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface UserPlan extends Pick<Document, '_id'> {
  plan_type:string;
  no_of_uploads:number;
  plan_amount:number;
  plan_currency:string;
  user_id:ObjectId;
}

const LoginAttemptSchema: Schema<UserPlan> = new Schema(
  {
    plan_type:{
        type:String,
        required:true,
    },
    no_of_uploads:{
        type:Number,
        required:true,
    },
    plan_amount:{
        type:Number,
        required:true,
    },
    plan_currency:{
        type:String,
        required:true,
    },
    user_id:{
        type:ObjectId,
        required:true,
    }
  },
  { timestamps: true },
);

const user_plan = mongoose.model('UserPlan', LoginAttemptSchema);

export default user_plan;
