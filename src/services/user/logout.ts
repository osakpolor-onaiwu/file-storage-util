import {removeToken, blacklistTokens, updateLoginAttempt } from "../../dal/user"
import { ObjectId } from "mongodb";
import { RefreshToken, TokenFindOptions } from '../../types/user';
import throwcustomError from '../../utils/customerror'

export async function logout(options: TokenFindOptions) {
    try {
        await Promise.all([
            removeToken(options),
            blacklistTokens([options.refresh_token as string, options.access_token_id as string]),
            updateLoginAttempt({
              user_id: new ObjectId(options.user_id),
              token_id: options.access_token_id as string,
              logged_out: true,
              logged_out_at: new Date().toISOString(),
            }),
          ]);
      
          return {
              message: "logout successful",
              data: {}
          }   
    } catch (error: any) {
        throwcustomError(error.message);
    }
  }