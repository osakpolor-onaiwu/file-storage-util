import { findToken, find as findUser } from "../../dal/user";
import { ObjectId } from "mongodb";

export async function isAccessTokenBlacklisted(token_id: string) {
    const token = await findToken({ access_token_id: token_id, in_blacklist: true });
    return token === '' ? false : true;
}

export async function getUser(key: string | ObjectId) {
  return await findUser({_id: key, email: key as string, username: key as string}, "-password");
}
