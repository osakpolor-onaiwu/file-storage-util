import UserPlanModel, { UserPlan } from '../models/plan';
import { Document } from 'mongoose';
import { SearchType, optConfig} from '../types/db_search_types'

export async function saveUserPlan(data: UserPlan, model: typeof UserPlanModel): Promise<Document> {
    const new_UserPlan = new model(data);
    return new_UserPlan.save();
}

export async function findUserPlan(
    data: object,
    model: typeof UserPlanModel,
    searchType: string,
    projection?: string | string[] | { [key: string]: number },
    options?: optConfig,
): Promise<UserPlan> {
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

export async function updateUserPlan(filter: object, data: UserPlan, model: typeof UserPlanModel): Promise<any> {
    return await model.findOneAndUpdate(filter, data, { new: true });
}

export async function deleteUserPlan(data: object, model: typeof UserPlanModel): Promise<any> {
    return await model.findOneAndDelete(data);
}


export async function countDocument(data: object, model: any) {
    return await model.where(data).countDocuments();
}