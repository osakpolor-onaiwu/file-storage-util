import { NextFunction, Request, Response } from 'express';
import Joi, { string } from 'joi';
import { validateSchema } from '../../utils/validatespec';
import { User } from '../../models/user';
import { registerUser } from '../../services/user/register';
import { jsonS, jsonErr } from '../../utils/responses';


const registration_schema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().trim().required(),
    username: Joi.string().trim().max(10).required()
})

export default async function register(req:Request, res:Response, next:NextFunction) {
    try {
        const user = validateSchema(registration_schema, req.body) as User;
        const response = await registerUser(user);
        jsonS(res, response?.message || "User registered", {});
    } catch (e: any) {
        console.error('e---',e)
        jsonErr(res,e.message, null);
    }
}