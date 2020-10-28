import { Model, model, Schema, Document } from "mongoose";

export enum GameRec {
  win,
  lose,
  draw,
}

export interface UserPlayType {
  player2ID: string;
  isWin: GameRec | boolean;
  gameID: string;
}

export enum WiningsType {
  p1,
  p2,
}
const playSchema: Schema<UserPlayType> = new Schema({
  player2ID: {
    type: String,
    required: true,
  },
  isWin: {
    type: GameRec,
    required: true,
  },
  gameID: {
    type: String,
    required: true,
  },
});

const UserPlay: Model<UserPlayType & Document, {}> = model(
  "user_play",
  playSchema
);

export default UserPlay;
