import { User } from "../../models/user";
import { find as findUser } from "../../dal/user";
import bcrypt from "bcrypt";
import { generateToken } from '../../utils/jwt';
import { LoginInfo } from "../../types/user";
import { saveLoginAttempt, saveRefreshToken } from "../../dal/user";
import { v4 as uuidV4 } from "uuid";
import ObjectId from "mongodb";
import moment from "moment";
import throwcustomError from '../../utils/customerror'
import { USER_ACCESS_TOKEN_EXPIRY } from "../../utils/misc";

export async function authenticateUser(data: User, login_info: LoginInfo) {
    try {
        const user = await findUser({email: data.email as string, username: data.username as string});
        if (!user) throw new Error('user does not exist');

        const result = await bcrypt.compare(data.password as string, user.password as string);
        if (!result) throw new Error("Invalid password");

        const user_payload = { user_id: user._id, email: user.email || '', username: user.username || '' };
        const token_object = generateToken(user_payload, { is_app: false, expiresIn: USER_ACCESS_TOKEN_EXPIRY});

        const refresh_token = await createRefreshToken(user._id, token_object.token_id);

        await saveLoginAttempt({
            user_id: user._id,
            logged_in_at: new Date().toISOString(),
            ip_address: login_info.ip_address,
            user_agent: login_info.user_agent,
            token_id: token_object.token_id,
        }); 
        
        return {
            message: "Login successful",
            data: {
                token: token_object.token,
                refresh_token
            }
        }
    } catch (error: any) {
        throwcustomError(error.message)
    }
}

export async function createRefreshToken(user_id: any, access_token_id: string) {
    if (!user_id || !access_token_id) throw new Error("user id or access token id is missing")

    const refresh_token = uuidV4();

    await saveRefreshToken({
      refresh_token,
      user_id,
      expiry: moment().add(1, 'days').valueOf(), // milliseconds
      access_token_id,
    });

    return refresh_token;
}