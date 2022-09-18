import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface UserPlan extends Pick<Document, '_id'> {
  plan_id:ObjectId;
  user_id: ObjectId;
  meta?:string;
}

const PlanSchema: Schema<UserPlan> = new Schema(
  {
    plan_id:{
        type:ObjectId,
        required:true,
    },
    user_id:{
      type:ObjectId,
      required:true,
    },
    meta: {
        type:String,
        required:false
    }
  },
  { timestamps: true },
);

const UserPlanModel = mongoose.model('UserPlan', PlanSchema);

export default UserPlanModel;
