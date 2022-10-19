import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger';
import axios from 'axios';

const spec = joi.object({
    name: joi.string().required(),
    currency:joi.string().required(),
    amount: joi.number().positive().required(),
    interval: joi.any().valid("monthly","weekly").default('monthly'),
    duration: joi.string()
})

export async function flw_paymentplan(data: any) {
    
    try {
        const params = validateSchema(spec, data);
        const headers = {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
        const created_plan = await axios.post(`${process.env.FLW_PLAN_URL}`, params, { headers });
        if(!created_plan) throw new Error('error creating plan');

        return created_plan.data.data;
    } catch (error: any) {        
        console.log('flw plan create error--',error)
        throwcustomError(error.message);
    }
}