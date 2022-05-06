export async function countDocument(data: object, model: any) {
    return await model.where(data).countDocuments();
}