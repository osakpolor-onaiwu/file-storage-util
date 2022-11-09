import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger'
import UserPlanModel from '../../models/user.plan';
import { saveUserPlans,findUserPlans } from '../../dal/user.plan';
import TransactionModel, { Transaction } from '../../models/transactions';
import PlanModel from '../../models/plan';
import { findAllPlans } from '../../dal/plan';
import { saveTransaction } from '../../dal/transaction'
import { find } from '../../dal/user';
import { randomBytes } from 'crypto';
import { service_return } from '../../interface/service_response'
import { flw_charge } from './flw_charge'
const spec = joi.object({
    account_id: joi.string().trim().required(),
    redirect_url: joi.string().trim().uri().optional(),
    customer: joi.object().optional(),
    amount: joi.string().optional(),
    currency: joi.string().trim().uppercase().length(3).default('NGN'),
    meta: joi.object(),
})

//this should be a worker, or we have worker call this instead of an enpoint
//since all the info should be from the plan
export async function charge(data: any) {

    try {
        const params = validateSchema(spec, data);
        //fetch user details
        const user_details = await find({ _id: params.account_id });
        if (!user_details) throw new Error('user not found')
        if (!params.customer) params.customer = {
            email: user_details?.email
        }
        if (!params.meta) {
            params.meta = {}
            params.meta.customer_id = params.account_id;
            params.meta.first_name = user_details?.username
        }
        //generate tx_ref
        params.tx_ref = randomBytes(8).toString('hex');
        if (!params.redirect_url) params.redirect_url = process.env.REDIRECT_URL

        //get amount from user plan
        const findUserPlan = await findUserPlans({
            user_id: params.account_id
        }, UserPlanModel,'one');
     
        if(!findUserPlan) throw new Error('User plan not found');

        const findPlanDetails = await findAllPlans({
            _id: findUserPlan.plan_id,
        }, PlanModel, 'one');

        if (!findPlanDetails) throw new Error('Plan details not found');
        
        params.amount = String(findPlanDetails.plan_amount);
        params.plan_id = findPlanDetails.flw_plan_id;

        const link = await flw_charge(params);
        params.payment_link = link;
        
        //save tx
        await saveTransaction({
            tx_ref: params.tx_ref,
            account_id: params.account_id,
            amount: findPlanDetails.plan_amount
        }, TransactionModel)

        const res: service_return = {
            data: params,
            message: `Charge in progress`
        }
        return res;
    } catch (error: any) {
        console.log('err--', error)
        throwcustomError(error.message);
    }
}