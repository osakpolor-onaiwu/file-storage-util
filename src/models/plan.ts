import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';
export interface AllPlans extends Pick<Document, '_id'> {
  plan_duration?:number;
  plan_name: string;
  no_of_uploads:number;
  plan_amount:number;
  plan_currency:string;
  no_of_conversion:number;
  meta:object;
  interval: string,
  status: string,
  plan_token?:string,
  flw_plan_id?:string
}

const PlanSchema: Schema<AllPlans> = new Schema(
  {
    plan_duration:{
        type:Number,
        required:false,
    },
    plan_name:{
      type:String,
      required:true,
      unique: true,
    },
    interval: {
      type:String,
      required:false,
    },
    status: {
      type:String,
      required:false,
    },
    plan_token: {
      type:String,
      required:false,
    },
    no_of_uploads:{
        type:Number,
        required:true,
    },
    no_of_conversion:{
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
    flw_plan_id:{
      type:String,
      required:false,
  },
    meta:{
        type:Object,
        required:false,
    }
  },
  { timestamps: true },
);

const PlanModel = mongoose.model('AllPlans', PlanSchema);

export default PlanModel;
