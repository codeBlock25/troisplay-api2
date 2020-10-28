import { Schema, Document, model, Model } from "mongoose";

export interface referalType extends Document {
  userID: string;
  activeReferal: number;
  inactiveReferal: number;
  refer_code: string;
}

const ReferalSchema: Schema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  activeReferal: {
    type: Number,
    required: true,
    default: 0,
  },
  inactiveReferal: {
    type: Number,
    required: true,
    default: 0,
  },
  refer_code: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
});

const ReferalModel: Model<referalType, {}> = model<referalType>(
  "referals",
  ReferalSchema
);

export default ReferalModel;
