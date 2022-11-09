import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger';
import axios from 'axios';
import { service_return } from '../../interface/service_response';

const spec = joi.object({
    amount: joi.number().required(),
    redirect_url: joi.string().trim().uri().required(),
    currency:joi.string().required(),
    customer: joi.object().required(),
    tx_ref: joi.string().required(),
    plan_id: joi.number().required(),
})

//passing the plan_id makes it a recurring charge flw will handle the recurrence
export async function flw_charge(data: any) {
    
    try {
        const params = validateSchema(spec, data);
        params.payment_plan = params.plan_id;
        delete params.plan_id;

        const headers = {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
        const link = await axios.post(`${process.env.FLW_CHARGE_URL}`, params, { headers });
        if(!link) throw new Error('error getting link');

        const res : service_return = {
            data: link.data,
            message: `payment link retrieved`
        }
        return res
    } catch (error: any) {        
        Logger.error(error.message, { service: 'flw_charge-error' });
        throwcustomError(error.message);
    }
}