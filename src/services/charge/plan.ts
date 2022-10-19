import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger'
import PlanModel from '../../models/plan';
import { saveAllPlans } from '../../dal/plan';
import { flw_paymentplan } from './flw_paymentplan'
// import UserModel from '../../models/user';
import { find as findUser } from '../../dal/user';
import { service_return } from '../../interface/service_response'


const spec = joi.object({
    account_id: joi.string().trim().required(),
    plan_duration: joi.number(),
    plan_name: joi.string().valid('free', 'basic', 'premium').required(),
    no_of_conversion: joi.number().required(),
    plan_amount: joi.number().required(),
    no_of_uploads: joi.number().required(),
    plan_currency: joi.string().trim().uppercase().length(3).default('NGN'),
    meta: joi.object().optional(),
    plan_interval: joi.string(),
    payment_plan: joi.string().optional()
})

export async function create(data: any) {
    try {
        const params = validateSchema(spec, data);
        const User_role = await findUser({ _id: params.account_id })
        const { plan_duration, plan_interval, plan_name, no_of_conversion, no_of_uploads, plan_amount, plan_currency, meta } = params;
        if (User_role?.role !== 'admin') throw new Error('only admin can create plans');
        
        let created_plan = null
        if(params.plan_name !== 'free'){
            created_plan = await flw_paymentplan({
                name: plan_name,
                currency: plan_currency,
                interval: plan_interval,
                amount: plan_amount,
            })

            if (!created_plan) throw new Error('plan not created');
        }

        const created = await saveAllPlans({
            plan_duration, plan_name,
            no_of_conversion, no_of_uploads,
            plan_amount, plan_currency, meta,
            status: created_plan?.status,
            plan_token: created_plan?.plan_token,
            flw_plan_id: created_plan?.id,
            interval: created_plan?.interval
        },
            PlanModel)

        const res: service_return = {
            message: "plan created",
            data: created
        }
        return res
    } catch (error: any) {
        console.log('****', error)
        throwcustomError(error.message);
    }
}