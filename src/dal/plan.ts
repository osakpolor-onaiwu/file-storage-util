import PlanModel, { AllPlans} from '../models/plan';
import { Document } from 'mongoose';
import { SearchType, optConfig} from '../types/db_search_types'

export async function saveAllPlans(data: AllPlans, model: typeof PlanModel): Promise<Document> {
    const new_Plans = new model(data);
    return new_Plans.save();
}

export async function findAllPlans(
    data: object,
    model: typeof PlanModel,
    searchType: string,
    projection?: string | string[] | { [key: string]: number },
    options?: optConfig,
): Promise<AllPlans> {
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

export async function updateAllPlans(filter: object, data: AllPlans, model: typeof PlanModel): Promise<any> {
    return await model.findOneAndUpdate(filter, data, { new: true });
}

export async function deleteAllPlans(data: object, model: typeof PlanModel): Promise<any> {
    return await model.findOneAndDelete(data);
}


export async function countDocument(data: object, model: any) {
    return await model.where(data).countDocuments();
}