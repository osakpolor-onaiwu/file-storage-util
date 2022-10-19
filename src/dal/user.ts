import UserModel, { User } from '../models/user';
import { Document } from 'mongoose';
import { ObjectId } from 'bson';
import { removeEmptyfilters, stripEmptyProperties } from '../utils/misc';
import RedisClient from '../utils/redis';
import { RefreshToken, TokenFindOptions } from '../types/user';
import LoginAttemptModel, { LoginAttempt } from '../models/login-attempt';

const TOKEN_LIST = 'token_list';
const TOKEN_BLACKLIST = 'user_token_blacklist';

export async function save(data: User): Promise<Document> {
    const new_user = new UserModel(data);
    return new_user.save();
}

export async function find(user: User, projection?: string | string[] | {[key: string]: number}) {
    if (user._id && ObjectId.isValid(user._id)) return await UserModel.findOne({ _id: new ObjectId(user._id) }).lean().select(projection || "");
    else
      return await UserModel.findOne(removeEmptyfilters({
        $or: [{ email: user.email }, { username: user.username }],
      })).lean().select(projection || "");
}

export async function saveRefreshToken(token_details: RefreshToken) {
    // each new token is assigned a time to live (TTL) of 24 hrs. It is represented in milliseconds hence the 'PX' string.
    if (!token_details.user_id) throw new Error('user id is required to save a token');
    const user_tokens = String(token_details.user_id) + `:${TOKEN_LIST}`;

    await RedisClient.multi()
      .set(token_details.refresh_token, token_details.access_token_id, 'PX', token_details.expiry)
      .set(token_details.access_token_id, token_details.refresh_token, 'PX', token_details.expiry)
      .lpush(user_tokens, token_details.refresh_token, token_details.access_token_id)
      .exec();
}

export async function findToken(options: TokenFindOptions) {
    // check if token belongs to user
    if (options.user_id) {
      const user_tokens = String(options.user_id) + `:${TOKEN_LIST}`;

      let index;
      if (options.refresh_token) index = await RedisClient.lpos(user_tokens, options.refresh_token);
      if (options.access_token_id) index = await RedisClient.lpos(user_tokens, options.access_token_id);

      if (index === null || (index && index < 0)) return '';
      return (await RedisClient.lindex(user_tokens, index as number)) || '';
    }

    // check if token is in the blacklist
    if (options.in_blacklist) {
      let index;

      if (options.refresh_token) index = await RedisClient.lpos(TOKEN_BLACKLIST, options.refresh_token);
      if (options.access_token_id) index = await RedisClient.lpos(TOKEN_BLACKLIST, options.access_token_id);

      if (index === null || (index && index < 0)) return '';

      return (await RedisClient.lindex(TOKEN_BLACKLIST, index as number)) || '';
    }

    // check if token has not expired
    if (options.refresh_token) return (await RedisClient.get(options.refresh_token)) || '';
    if (options.access_token_id) return (await RedisClient.get(options.access_token_id)) || '';
    return '';
}

export async function blacklistTokens(token: string | string[]) {
    await RedisClient.lpush(TOKEN_BLACKLIST, token as string);
}

export async function removeToken(options: TokenFindOptions) {
    if (!options.user_id) throw new Error('user id is required to remove a token');
    const user_tokens = String(options.user_id) + `:${TOKEN_LIST}`;

    if (options.refresh_token)
      await RedisClient.multi().del(options.refresh_token).lrem(user_tokens, 1, options.refresh_token).exec();

    if (options.access_token_id)
      await RedisClient.multi().del(options.access_token_id).lrem(user_tokens, 1, options.access_token_id).exec();
}

export async function findAllTokens(user_id: string) {
    if (user_id) throw new Error('user id is required to find tokens');
    const user_tokens = String(user_id) + `:${TOKEN_LIST}`;

    return await RedisClient.lrange(user_tokens, 0, -1);
  }

export async function removeAllTokens(user_id: string) {
    const user_tokens = String(user_id) + `:${TOKEN_LIST}`;
    const all_refresh_tokens = await findAllTokens(user_id);

    if (!all_refresh_tokens || all_refresh_tokens.length === 0) return [];

    // delete the user's token list
    await RedisClient.del(user_tokens);

    // remove all of the refresh tokens that have a TTL associated
    await RedisClient.unlink(all_refresh_tokens);

    return all_refresh_tokens;
}

export async function saveLoginAttempt(login_attempt: LoginAttempt) {
    const new_attempt = new LoginAttemptModel(login_attempt);
    return await new_attempt.save();
  }

export async function updateLoginAttempt(login_attempt: LoginAttempt) {
    return LoginAttemptModel.updateOne(
      { user_id: login_attempt.user_id, token_id: login_attempt.token_id },
      stripEmptyProperties(login_attempt),
      { new: true, rawResult: true },
    );
  }