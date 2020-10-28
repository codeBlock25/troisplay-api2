import { Model, model, Schema, Document } from "mongoose";
import { Games } from "./games";

export interface recordType extends Document {
  userID: string;
  date_mark: Date;
  game: Games;
  won: string;
  earnings: number;
}

const RecordSchema: Schema = new Schema({
  userID: {
    type: String,
    required: true,
  },
  date_mark: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  game: {
    type: Games,
    required: true,
    default: 0,
  },
  won: {
    type: String,
    required: true,
    default: 0,
  },
  earnings: {
    type: Number,
    required: true,
    default: 0,
  },
});

const RecordModel: Model<recordType, {}> = model<recordType>(
  "records",
  RecordSchema
);

export default RecordModel;
