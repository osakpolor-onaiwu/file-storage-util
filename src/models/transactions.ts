import mongoose, { Schema, Document } from 'mongoose';
export interface Transaction extends Pick<Document, '_id'> {
    status?: string;
    transaction_id?: string;
    tx_ref: string;
    account_id?: string;
    amount?: number
}

const TransactionSchema: Schema<Transaction> = new Schema(
    {
        status: {
            type: String,
        },
        transaction_id: {
            type: String,
            required: false,
        },
        tx_ref: {
            type: String,
            required: false,
        },
        account_id: {
            type: String,
            required: false,
        },
        amount: { type: Number }
    },
    { timestamps: true },
);

TransactionSchema.index({ transaction_id: 1, tx_ref: 1 }, { unique: true })
const TransactionModel = mongoose.model('Transaction', TransactionSchema, 'transaction');

export default TransactionModel;
