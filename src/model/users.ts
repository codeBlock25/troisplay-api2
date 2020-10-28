import { model, Schema, Document, Model } from "mongoose";

export interface UserType extends Document {
  full_name: string;
  phone_number: string;
  key: string;
  date_of_creation: Date;
}

const userSchema: Schema = new Schema({
  full_name: {
    required: true,
    type: String,
    lowercase: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  key: {
    type: String,
    required: true,
  },
  date_of_creation: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

const users: Model<UserType, {}> = model<UserType>("user_account", userSchema);
export default users;
