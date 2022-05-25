import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface User extends Pick<Document, "_id"> {
  email?: string;
  password?: string;
  hash_password?: string;
  username?: string;
  blacklisted?: boolean
}

const UserSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  { timestamps: true },
);

// * Hash the password before it is saved to the database
UserSchema.pre('save', async function (next: (err: Error | null) => void) {
  // Make sure you don't hash the hash
  if (!this.isModified('password')) {
    return next(null);
  }
  this.password = await bcrypt.hash(this.password as string, parseInt(process.env.SALT_ROUNDS));
  next(null);
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
