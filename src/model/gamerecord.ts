import { Model, model, Schema, Document } from "mongoose";

export interface recordType extends Document {
  userID: string;
  date_mark: Date;
  winnings: number;
  losses: number;
  earnings: number;
  draws: number;
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
  winnings: {
    type: Number,
    required: true,
    default: 0,
  },
  losses: {
    type: Number,
    required: true,
    default: 0,
  },
  draws: {
    type: Number,
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
