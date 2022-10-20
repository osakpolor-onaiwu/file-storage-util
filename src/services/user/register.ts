import { User } from "../../models/user";
import { find as findUser } from "../../dal/user";
import { save as saveUser } from "../../dal/user";
import throwcustomError from '../../utils/customerror';
import { validateSchema } from '../../utils/validatespec';
import joi from 'joi';
import { notifier } from '../../email/notifier';

const spec = joi.object({
  username:joi.string().required(),
  email:joi.string().email().required(),
  role:joi.string().default('owner'),
  password:joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/i).error(new Error(
   'password must be more than 8 character long. it must be alphanumeric and contain special characters')).required()
})

export async function registerUser(data: User) {
  
    try {
        const user = validateSchema(spec,data);
        const user_exists = await findUser({email: user.email as string, username: user.username as string, role: user.role as string});

        if (user_exists) throw new Error('user with this email or username exists already');
        const save_result = await saveUser(user);

        if (save_result) {

          await notifier({
            user_email: user.email,
            user_name: user.name,
            subject: 'Email verification',
            link: `${process.env.SITE_URL}/${save_result._id}`
          });

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
