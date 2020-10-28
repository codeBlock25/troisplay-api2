import { model, Model, Document, Schema } from "mongoose";

export interface roomHint {
  room_name: string;
  date: Date;
  last_changed: Date;
  entry_price: number;
  key_time: number;
  player_limit: number;
  addedBy: string;
  activeMember: number;
  players: [string];
}

const roomSchema: Schema<roomHint> = new Schema({
  room_name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  last_changed: {
    type: Date,
    default: new Date(),
  },
  entry_price: {
    type: Number,
    required: true,
  },
  key_time: {
    type: Number,
    required: true,
  },
  player_limit: {
    type: Number,
    required: true,
  },
  players: {
    type: Array,
    required: true,
    default: [],
  },
  activeMember: {
    type: Number,
    required: true,
    default: 0,
  },
  addedBy: {
    type: String,
    required: true,
  },
});

const roomModel: Model<roomHint & Document, {}> = model("rooms", roomSchema);
export default roomModel;
