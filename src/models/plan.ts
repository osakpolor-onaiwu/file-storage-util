import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface AllPlans extends Pick<Document, '_id'> {
  plan_duration:string;
  plan_name: string;
  no_of_uploads:number;
  plan_amount:number;
  plan_currency:string;
  no_of_conversion:number;
  meta?:object;
  payment_plan?:string;
}

const PlanSchema: Schema<AllPlans> = new Schema(
  {
    plan_duration:{
        type:String,
        required:true,
    },
    plan_name:{
      type:String,
      required:true,
    },
    payment_plan: {
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
    meta:{
        type:Object,
        required:false,
    }
  },
  { timestamps: true },
);

const PlanModel = mongoose.model('AllPlans', PlanSchema);

export default PlanModel;
