import { Schema, model, Model, Document } from "mongoose";

export interface playerType extends Document {
  userID: string;
  playername: string;
  playerpic: string;
  email: string;
  location: string;
  isConfirmPolicy: boolean;
  bank_name: string;
  about_me: string
  account_number: string;
  recovery_question: string;
  recovery_answer: string;
}

const player: Schema = new Schema({
  userID: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  playername: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  bank_name: {
    type: String,
    required: true,
    lowercase: true,
  },
  account_number: {
    type: String,
    required: true,
    lowercase: true,
  },
  recovery_question: {
    type: String,
    required: true,
    lowercase: true,
  },
  recovery_answer: {
    type: String,
    required: true,
    lowercase: true,
  },
  playerpic: {
    type: String,
    required: true,
    default: "media/icon.png",
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  location: {
    type: String,
  },
  isConfirmPolicy: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const PlayerModel: Model<playerType, {}> = model<playerType>("players", player);

export default PlayerModel;
