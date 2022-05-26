import { User } from "../../models/user";
import { find as findUser } from "../../dal/user";
import { save as saveUser } from "../../dal/user";
import throwcustomError from '../../utils/customerror'

export async function registerUser(user: User) {
    try {
        const user_exists = await findUser({email: user.email as string, username: user.username as string});

        if (user_exists) throw new Error('user exists already');
        const save_result = await saveUser(user);
    
        if (save_result) {
          return {
              message: "Registration successful",
              data: {}
          }
        } else {
          throw new Error("Could not register user");
        }   
    } catch (error: any) {
        throwcustomError(error.message);
    }
}

export async function authenticate(user: User) {
    
}