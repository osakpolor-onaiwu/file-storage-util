import { User } from "../../models/user";
import { find as findUser } from "../../dal/user";
import { save as saveUser } from "../../dal/user";
import throwcustomError from '../../utils/customerror'

export async function registerUser(user: User) {
    try {
        const user_exists = await findUser({email: user.email as string, username: user.username as string, role: user.role as string});

        if (user_exists) throw new Error('user with this email or username exists already');
        const save_result = await saveUser(user);
    
        if (save_result) {
          return {
              message: "Registration successful",
              data: save_result
          }
        } else {
          throw new Error("Could not register user");
        }   
    } catch (error: any) {
      console.log(error)
        throwcustomError(error.message);
    }
}

// export async function authenticate(user: User) {
    
// }