import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validateSchema } from '../../utils/validatespec';
import { jsonS, jsonErr } from '../../utils/responses';
import { authenticateUser } from '../../services/user/authenticate';

const login_schema = Joi.object({
  email: Joi.string().email().trim(),
  username: Joi.string().trim(),
  password: Joi.string().trim().required(),
  ip_address: Joi.string().trim().ip().required(),
  user_agent: Joi.string().trim().required(),
}).xor('email', 'username');

export default async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = validateSchema(login_schema, req.body);
    const response = await authenticateUser(data, {
      ip_address: data['ip_address'],
      user_agent: data['user_agent'],
    });
    jsonS(res, response?.message || "Login successful", response?.data);
  } catch (e: any) {
    jsonErr(res, e.message, null)
  }
}