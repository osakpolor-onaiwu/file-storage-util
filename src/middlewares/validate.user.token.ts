import { NextFunction, Request, Response } from 'express';
import { getUser, isAccessTokenBlacklisted } from '../services/user/misc';
import { UserAccessTokenPayload } from '../types/user';
import { verify as verifyJwt } from '../utils/jwt';
import { objectIsEmpty } from '../utils/misc';
import customError from "../utils/customerror";

export function validateUserToken(req: Request, res: Response, next: NextFunction) {

  try {
    if (!req.headers.authorization) {
      throw customError('Missing authorization');
    }

    const token = req?.headers ? req.headers.authorization.split(' ') : [];

    // check that the value of the `Authorization` header contains both `Bearer` and `${value}`
    if (token.length !== 2)
      throw customError('invalid_request, please provide a valid token.');

    if (token[0] !== 'Bearer')throw customError('Token type provided is not valid');

    const result = verifyJwt(token[1]);
    console.log('res--',result);
    const decoded_token = result as unknown as UserAccessTokenPayload;
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
      req.body.user_name = user.username;
      req.body.email = user.email;
      req.body.role = user.role;
      req.body.is_verified = user.is_verified;
      req.body.blacklisted = user.blacklisted;
      req.query.user_id = user._id;
      console.log('++++',{body:req.body,query:req.query})
      next();
    }).catch((error) => {
      console.log('here--',error);

      if (error.name === 'TokenExpiredError') {
        throw customError('the token provided has expired, please login again.');
      }

      if (error.name === 'JsonWebTokenError') {
        throw customError('Wrong token passed');
      }

      next(error);
    })
  } catch (error: any) {
    throw customError(error.message);
  }
}