import { LoginInfo } from "../../types/user";
import { find as findUser, findToken, blacklistTokens, saveLoginAttempt } from "../../dal/user";
import { generateToken } from "../../utils/jwt";
import { USER_ACCESS_TOKEN_EXPIRY } from "../../utils/misc";
import { User } from "../../models/user";
import { createRefreshToken } from "./authenticate";
import throwcustomError from '../../utils/customerror'

export async function generateNewToken(data: {user_id: string, r_token: string, login_info: LoginInfo}) {
    try {
        const user = await findUser({_id: data.user_id});
        if (!user) throw new Error('user does not exist');
    
        // check if refresh_token is blacklisted
        let refresh_token = await findToken({ refresh_token: data.r_token, in_blacklist: true });
        if (refresh_token)
          throw new Error('refresh token passed has either been used before or is not valid');
    
        // check if refresh_token has expired
        refresh_token = await findToken({ refresh_token: data.r_token });
        if (!refresh_token) throw new Error('refresh token passed has expired');
    
        // check if token belongs to this user
        refresh_token = await findToken({ refresh_token: data.r_token, user_id: data.user_id});
        if (!refresh_token) throw new Error('refresh token passed is invalid');
    
        // blacklist token so it can't be used again
        await blacklistTokens(data.r_token);
    
        const user_payload = { user_id: user._id, email: (user as User).email || '', username: (user as User).username || '' };
    
        const token_object = generateToken(user_payload, { is_app: false, expiresIn: USER_ACCESS_TOKEN_EXPIRY });
    
        const new_refresh_token = await createRefreshToken(user._id, token_object.token);
    
        await saveLoginAttempt({
          user_id: user._id,
          logged_in_at: new Date().toISOString(),
          ip_address: data.login_info.ip_address,
          user_agent: data.login_info.user_agent,
          token_id: token_object.token_id,
        });
    
        return {
            message: "Token refreshed successfully",
            data: {
                token: token_object.token,
                refresh_token: new_refresh_token
            }
        }   
    } catch (error: any) {
        throwcustomError(error.message)
    }
}