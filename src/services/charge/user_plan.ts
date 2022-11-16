import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger'
import PlanModel from '../../models/plan';
import { findAllPlans } from '../../dal/plan';
import ActionModel from '../../models/actioncount';
import UserPlanModel from '../../models/user.plan';
import { saveUserPlans,findUserPlans } from '../../dal/user.plan';
import { saveAction,findAction } from '../../dal/action';
import { service_return } from '../../interface/service_response'

const spec = joi.object({
    account_id: joi.string().trim().required(),
    plan_id: joi.string().required(),
})


export async function chooseUserPlan(data: any) {
    try {
        const params = validateSchema(spec, data);

        const findPlans = await findAllPlans({
            _id: params.plan_id,
        }, PlanModel, 'one');

        if (!findPlans) throw new Error('Plan does not exist');
        await saveAction({
            accountid: params.account_id,
            month:new Date()
        },ActionModel)
    
        const plan_choosed = await saveUserPlans({
            plan_id: params.plan_id,
            user_id: params.account_id
        }, UserPlanModel)
        
        
        const res : service_return = {
            message: "plan choosed",
            data: plan_choosed
        }
        return res
    } catch (error: any) {
        if(error.message.includes('Cast'))error.message = 'Please pass a valid plan id.';
        throwcustomError(error.message);
    }
}

const specb = joi.object({
    account_id: joi.string().trim().required(),
})

export async function fetchUserPlan(data: any) {

    try {
        const params = validateSchema(specb, data);
       
        const findUserPlan = await findUserPlans({
            user_id: params.account_id
        }, UserPlanModel,'one');
     
        if(!findUserPlan) throw new Error('User does not have any plan selected');

        const findPlanDetails = await findAllPlans({
            _id: findUserPlan.plan_id,
        }, PlanModel, 'one');

        if (!findPlanDetails) throw new Error('Plan details not found');
        const res = {
            user_id: params.account_id,
            plan_id:findUserPlan.plan_id,
            ...findPlanDetails
        }
        return {
            message: "user plan fetched",
            data: res
        };
    } catch (error: any) {
        if(error.message.includes('Cast'))error.message = 'Please pass a valid user id.';
        throwcustomError(error.message);
    }
}