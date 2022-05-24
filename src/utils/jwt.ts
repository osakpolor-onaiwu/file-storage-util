import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * JWT signing options
 */
export interface JWTOptions {
  /**
   * this flag determines whether or not we are generating a token for an app or a user
   */
  is_app: boolean;
  audience?: string | undefined;
  subject?: string | undefined;
  expiresIn?: string | number | undefined;
}

/**
 * Generates a JsonWebToken based on the payload and options supplied
 * @param payload: any
 * @param options: JWTOptions
 * @returns generateTokenRType
 */
export function generateToken(payload: any, options: JWTOptions): generateTokenRType {
  const sign_options: SignOptions = {
    issuer: process.env.BASE_URL,
    audience: options.audience || '',
    subject: options.subject || '',
    algorithm: 'HS256',
  };

  if (!options.is_app && options.expiresIn) sign_options.expiresIn = options.expiresIn;

  sign_options.jwtid = uuidv4();

  const token = jwt.sign(payload, process.env.TOKEN_SECRET, sign_options);

  return {
    token,
    token_id: sign_options.jwtid,
  };
}

/**
 * Verifies the signature and issuer of a given JsonWebToken
 * @param token
 * @returns string | JwtPayload
 */
export function verify(token: string) {
  return jwt.verify(token, process.env.TOKEN_SECRET, { algorithms: ['HS256'], issuer: process.env.BASE_URL });
}

/**
 * Describes the return type used by jwt.generateToken
 */
export type generateTokenRType = { token: string; token_id: string };
