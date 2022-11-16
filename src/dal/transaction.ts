import TransactionModel, { Transaction } from '../models/transactions';
import { Document } from 'mongoose';
import { SearchType, optConfig} from '../types/db_search_types'

export async function saveTransaction(data: Transaction, model: typeof TransactionModel): Promise<Document> {
    const new_transaction = new model(data);
    return new_transaction.save();
}

export async function findTransaction(
    data: object,
    model: typeof TransactionModel,
    searchType: string,
    projection?: string | string[] | { [key: string]: number },
    options?: optConfig,
): Promise<Transaction> {
    let result: any = {};
    if (searchType === SearchType.ONE) {
        result = await model
            .findOne(data)
            .lean()
            .select(projection || '');
    } else {
        result = await model
        .find(data)
        .lean()
        .limit(options?.limit || 10)
        .skip(options?.skip || 0)
        .select(projection || '')
        .sort(options?.sort || 'createdAt');
    }
    return result;
}

export async function updateTransaction(filter: object, data: any, model: typeof TransactionModel): Promise<any> {
    return await model.findOneAndUpdate(filter, data, { new: true });
}

export async function deleteTransaction(data: object, model: typeof TransactionModel): Promise<any> {
    return await model.findOneAndDelete(data);
}


export async function countDocument(data: object, model: any) {
    return await model.where(data).countDocuments();
}