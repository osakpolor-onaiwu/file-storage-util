import { validateSchema } from '../../utils/validatespec';
import throwcustomError from '../../utils/customerror'
import joi from 'joi';
import { Request } from 'express';
import { service_return } from '../../interface/service_response'

export async function user_details(data:any) {
console.log('data--',data)
  try {
    const res: service_return = {
      data,
      message: `User details fetched`
    }
    return res;
  } catch (error: any) {
    console.log('r---',error);
    throwcustomError(error.message);
  }
}
