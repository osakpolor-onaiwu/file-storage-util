import { ObjectId } from 'mongodb';
import { LoginAttempt } from '../models/login-attempt';

export type UserAccessTokenPayload = { user_id: ObjectId; email: string; phone: string; jti: string };

export type TokenFindOptions = {
  refresh_token?: string;
  user_id?: string;
  in_blacklist?: boolean;
  access_token_id?: string;
};

export interface RefreshToken {
  refresh_token: string;
  user_id: ObjectId;
  expiry: number;
  access_token_id: string;
}

export type LoginInfo = Pick<LoginAttempt, 'ip_address' | 'user_agent'>;
