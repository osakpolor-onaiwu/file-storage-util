import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger'
import PlanModel from '../../models/plan';
import { findAllPlans} from '../../dal/plan';
import { service_return } from '../../interface/service_response'


const spec = joi.object({
    plan_name:joi.string(),
    duration: joi.object(),
    amount: joi.number(),
    currency: joi.string().trim().uppercase().length(3).default('NGN'),
    meta: joi.object(),
})

export async function getplan(data: any) {
    try {
        const findPlans = await findAllPlans({},PlanModel,'all');

        const res : service_return = {
            message: "plans fetched",
            data:findPlans
        }
        return res
    } catch (error: any) {        
        throwcustomError(error.message);
    }
}