import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror';
import joi from 'joi';
import Logger from '../../utils/Logger';
import TransactionModel,{ Transaction } from '../../models/transactions';
import { findTransaction,updateTransaction } from '../../dal/transaction'
import { service_return } from '../../interface/service_response'
import Flutterwave from 'flutterwave-node-v3';
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY, null);
const spec = joi.object({
    status: joi.string().required(),
    transaction_id: joi.string().required(),
    tx_ref: joi.string().required()
})

export async function verify(data: any) {

    try {
        const params = validateSchema(spec, data);
        console.log('transaction verify-----', params)

        //find transaction
        const fetched_tx = await findTransaction({tx_id: params.tx_ref},TransactionModel,'one')
        if(!fetched_tx) throw new Error(`Could not find transaction ${params.tx_ref}`);
      
        const verify_tx = await flw.Transaction.verify({ id: params.transaction_id });
        if(verify_tx?.status == 'error') throw new Error(`${verify_tx?.message}`);
        if(
            verify_tx?.status == 'success' && 
            verify_tx?.data?.status === "successful" &&
            verify_tx.data?.amount === fetched_tx.amount
            ){

            await updateTransaction({
                tx_ref:params.tx_ref
            },
                {
                    status: verify_tx.data.status,
                    transaction_id:params.transaction_id
                },TransactionModel)
             // Success! Confirm the customer's payment
        }else{
            // Inform the customer their payment was unsuccessful
        }
        console.log('verify ts---',verify_tx)
          

        const res: service_return = {
            data: 1,
            message: `transaction verified`
        }
        return res
    } catch (error: any) {
        console.log('flw verify error--', error)
        throwcustomError(error.message);
    }
}

