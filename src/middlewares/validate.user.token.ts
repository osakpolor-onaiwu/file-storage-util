import { NextFunction, Request, Response } from 'express';
import { getUser, isAccessTokenBlacklisted } from '../services/user/misc';
import { UserAccessTokenPayload } from '../types/user';
import { verify as verifyJwt } from '../utils/jwt';
import { objectIsEmpty } from '../utils/misc';
import customError from "../utils/customerror";

export async function test(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.headers.authorization) {
        throw new Error('Missing authorization');
      }
  
      const token = req.headers.authorization.split(' ');
  
      // check that the value of the `Authorization` header contains both `Bearer` and `${value}`
      if (token.length !== 2)
        throw new Error('invalid_request');
  
      if (token[0] !== 'Bearer')
        throw new Error('Token type provided is not valid');
  
      const result = verifyJwt(token[1]);
      const decoded_token = result as UserAccessTokenPayload;
      const access_token_id = decoded_token['jti'];
  
      // check that this token has not been blacklisted (logged out, expired, or blacklisted for whatever reason)
      if (await isAccessTokenBlacklisted(access_token_id))
        throw new Error('The access token provided is not valid');
  
      // check that the user id specified in the jwt is a valid one
      const user = await getUser(decoded_token.user_id);
      if (!user || objectIsEmpty(user))
        throw new Error('no user is associated with this token');
  
      req.body.user_id = user._id;
  
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('the token provided has expired');
      }
  
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Malformed Token');
      }
  
      next(error);
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