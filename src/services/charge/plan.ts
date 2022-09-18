import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger'
import PlanModel from '../../models/plan';
import { saveAllPlans } from '../../dal/plan';
// import UserModel from '../../models/user';
import { find as findUser } from '../../dal/user';


const spec = joi.object({
    account_id: joi.string().trim().required(),
    plan_duration: joi.string().valid('monthly', 'yearly').default('monthly'),
    plan_name: joi.string().valid('free', 'basic', 'premium').required(),
    no_of_conversion: joi.number().required(),
    plan_amount: joi.number().required(),
    no_of_uploads: joi.number().required(),
    plan_currency: joi.string().trim().uppercase().length(3).default('NGN'),
    meta: joi.object().optional(),
    payment_plan: joi.string().optional()
})

export async function create(data: any) {
    try {
        const params = validateSchema(spec, data);
        const User_role = await findUser({ _id: params.account_id })
        const { plan_duration, plan_name, no_of_conversion, no_of_uploads,payment_plan, plan_amount, plan_currency, meta } = params;
        if (User_role?.role !== 'admin') throw new Error('only admin can create plans');
        const created_plan = await saveAllPlans({
            plan_duration, plan_name, 
            no_of_conversion, no_of_uploads, 
            plan_amount, plan_currency, meta,
            payment_plan
        },
            PlanModel)
     
        return {
            message: "plan created",
            data: created_plan
        }
    } catch (error: any) {
        throwcustomError(error.message);
    }
}