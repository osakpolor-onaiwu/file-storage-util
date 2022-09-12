import { NextFunction, Request, Response } from 'express';
import { getUser, isAccessTokenBlacklisted } from '../services/user/misc';
import { UserAccessTokenPayload } from '../types/user';
import { verify as verifyJwt } from '../utils/jwt';
import { objectIsEmpty } from '../utils/misc';
import customError from "../utils/customerror";
import { jsonS } from '../utils/responses';

export async function user_details(req: Request, res: Response, next: NextFunction) {

  try {
    if (!req.headers.authorization) {
      throw new Error('Missing authorization');
    }
    console.log(req.headers?.authorization);
    const token = req.headers.authorization.split(' ');

    // check that the value of the `Authorization` header contains both `Bearer` and `${value}`
    if (token.length !== 2)
      throw new Error('invalid_request');

    if (token[0] !== 'Bearer')
      throw new Error('Token type provided is not valid');

    const result = verifyJwt(token[1]);
    const decoded_token = result as UserAccessTokenPayload;
    const access_token_id = decoded_token['jti'];

    isAccessTokenBlacklisted(access_token_id).then((token_is_blacklisted) => {
      if (token_is_blacklisted) throw new Error('The access token provided is not valid');
      else {
        return getUser(decoded_token.user_id);
      }
    }).then((user) => {
      if (!user || objectIsEmpty(user))
        throw customError('no user is associated with this token');

      req.body.user_id = user._id;
      req.query.user_id = user._id;

      jsonS(res, "user fetched", user);
    }).catch((error) => {

      if (error.name === 'TokenExpiredError') {
        customError('the token provided has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        customError('Malformed Token');
      }

      customError(error.message);
    })
  } catch (error: any) {
    customError(error.message);
  }
}

export function validateUserToken(req: Request, res: Response, next: NextFunction) {

  try {
    if (!req.headers.authorization) {
      throw customError('Missing authorization');
    }

    const token = req?.headers ? req.headers.authorization.split(' ') : [];

    // check that the value of the `Authorization` header contains both `Bearer` and `${value}`
    if (token.length !== 2)
      throw customError('invalid_request,please provide a valid token.');

    if (token[0] !== 'Bearer')
      throw customError('Token type provided is not valid');

    const result = verifyJwt(token[1]);
    const decoded_token = result as UserAccessTokenPayload;
    const access_token_id = decoded_token['jti'];

    // check that this token has not been blacklisted (logged out, expired, or blacklisted for whatever reason)
    isAccessTokenBlacklisted(access_token_id).then((token_is_blacklisted) => {
      if (token_is_blacklisted) throw new Error('The access token provided is not valid');
      else {
        return getUser(decoded_token.user_id);
      }
    }).then((user) => {
      if (!user || objectIsEmpty(user))
        throw customError('no user is associated with this token');

      req.body.user_id = user._id;
      req.query.user_id = user._id;

      next();
    }).catch((error) => {

      if (error.name === 'TokenExpiredError') {
        throw customError('the token provided has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw customError('Malformed Token');
      }

      next(error);
    })
  } catch (error: any) {
    throw customError(error.message);
  }
}