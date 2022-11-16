import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import Logger from '../../utils/Logger';
import UserPlanModel from '../../models/user.plan';
import { saveUserPlans,findUserPlans } from '../../dal/user.plan';
import TransactionModel, { Transaction } from '../../models/transactions';
import PlanModel from '../../models/plan';
import { findAllPlans } from '../../dal/plan';
import { saveTransaction } from '../../dal/transaction';
import { find } from '../../dal/user';
import { randomBytes } from 'crypto';
import { service_return } from '../../interface/service_response';
import { flw_charge } from './flw_charge';

const spec = joi.object({
    card_no: joi.string().trim().required(),
    cvv: joi.string().trim().uri().optional(),
    expiry: joi.string().trim()
});

export async function charge(data: any) {

    try {
        const params = validateSchema(spec, data);
        //fetch user details
        const user_details = await find({ _id: params.account_id });
        if (!user_details) throw new Error('user not found');

        return 
    } catch (error: any) {
        console.log('err--', error)
        Logger.error(error.message, { service: 'check_subscription' });
        throwcustomError(error.message);
    }
}