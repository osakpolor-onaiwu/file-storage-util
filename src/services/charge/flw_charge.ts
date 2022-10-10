import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger';
import axios from 'axios';
import { service_return } from '../../interface/service_response'

const spec = joi.object({
    amount: joi.number().required(),
    redirect_url: joi.string().trim().uri().required(),
    currency:joi.string().required(),
    customer: joi.object().required(),
    tx_ref: joi.string().required()
})

//this should be a worker, or we have worker call this instead of an enpoint
//since all the info should be from the plan
export async function flw_charge(data: any) {
    
    try {
        const params = validateSchema(spec, data);
        console.log('params-----', params)
        const headers = {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
        const link = await axios.post(`${process.env.FLW_CHARGE_URL}`, params, { headers });
        if(!link) throw new Error('error getting link');

        console.log('----',link.data);
        const res : service_return = {
            data: link.data,
            message: `payment link retrieved`
        }
        return res
    } catch (error: any) {        
        console.log('flw charge error--',error)
        throwcustomError(error.message);
    }
}