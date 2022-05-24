import { NextFunction, Request, Response } from 'express';
import Joi, { string } from 'joi';
import { validateSchema } from '../../utils/validatespec';
import { User } from '../../models/user';
import { registerUser } from '../../services/user/register';
import { jsonS } from '../../utils/responses';
import { authenticateUser } from '../../services/user/authenticate';

const login_schema = Joi.object({
    email: Joi.string().email().trim(),
    username: Joi.string().trim(),
    password: Joi.string().trim().required(),
    ip_address: Joi.string().trim().ip().required(),
    user_agent: Joi.string().trim().required(),
  }).xor('email', 'username');

export default async function login(req:Request, res:Response, next:NextFunction) {
    try {
        const data = validateSchema(login_schema, req.body);
        const response = await authenticateUser(data, {
            ip_address: data['ip_address'],
            user_agent: data['user_agent'],
          });
        jsonS(res, response?.message || "Login successful", response?.data);
    } catch (e) {
        next(e);
    }
}