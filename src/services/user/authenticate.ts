import { User } from "../../models/user";
import { find as findUser } from "../../dal/user";
import bcrypt from "bcrypt";
import { generateToken } from '../../utils/jwt';
import { validateSchema } from '../../utils/validatespec';
import { saveLoginAttempt, saveRefreshToken } from "../../dal/user";
import { v4 as uuidV4 } from "uuid";
import moment from "moment";
import throwcustomError from '../../utils/customerror'
import Joi from 'joi';

const login_schema = Joi.object({
    email: Joi.string().email().trim(),
    username: Joi.string().trim(),
    password: Joi.string().trim().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/i).required(),
    ip_address: Joi.string().trim().ip().required(),
    user_agent: Joi.string().trim().required(),
  }).xor('email', 'username');

export async function authenticateUser(data: User) {
    const params = validateSchema(login_schema, data);

    try {
        //find user and check if password and email match
        const user = await findUser({email: params.email as string, username: params.username as string});
        if (!user) throw new Error('Email does not exist.');
        //if(!user.is_verified) throw new Error('please verify your email to proceed');
        const result = await bcrypt.compare(String(params.password), String(user.password));
        if (!result) throw new Error("Invalid password");


        //generate token for user
        const user_payload = { 
            user_id: user._id, 
            email: user.email || '', 
            username: user.username || '',
            role: user.role,
            is_verified:user.is_verified,
            blacklisted:user.blacklisted
        };
        const token_object = generateToken(user_payload);

        const refresh_token = await createRefreshToken(user._id, token_object.token_id);

        await saveLoginAttempt({
            user_id: user._id,
            logged_in_at: new Date().toISOString(),
            ip_address: params.ip_address,
            user_agent: params.user_agent,
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