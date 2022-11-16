import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror';
import joi from 'joi';
import Logger from '../../utils/Logger';
import TransactionModel, { Transaction } from '../../models/transactions';
import { findTransaction, updateTransaction } from '../../dal/transaction'
import { service_return } from '../../interface/service_response'
import Flutterwave from 'flutterwave-node-v3';
import axios from 'axios';

// const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY, null);
const spec = joi.object({
    status: joi.string().required(),
    transaction_id: joi.string().required(),
    tx_ref: joi.string().required()
})

export async function verify(data: any) {

    try {
        const params = validateSchema(spec, data);
        //find transaction
        const fetched_tx = await findTransaction({ tx_id: params.tx_ref }, TransactionModel, 'one')
        if (!fetched_tx) throw new Error(`Could not find transaction ${params.tx_ref}`);
        const headers = {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
        const verify = await axios.get(`${process.env.FLW_VERIFY_URL}${params.transaction_id}/verify`, { headers });
        const verify_tx = verify.data;
        if (verify_tx?.status == 'error') throw new Error(`${verify_tx?.message}`);
        if (
            verify_tx?.status == 'success' &&
            verify_tx?.data?.status === "successful" &&
            verify_tx.data?.amount === fetched_tx.amount
        ) {

            await updateTransaction({
                tx_ref: params.tx_ref
            },
                {
                    status: verify_tx.data.status,
                    transaction_id: params.transaction_id
                }, TransactionModel)
            // Success! Confirm the customer's payment
        } else {
            // Inform the customer their payment was unsuccessful
            await updateTransaction({
                tx_ref: params.tx_ref
            },
                {
                    status: 'failed',
                    transaction_id: params.transaction_id
                }, TransactionModel)
        }

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

