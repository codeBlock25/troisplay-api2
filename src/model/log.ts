import { Schema, Document, Model, model } from "mongoose";

export interface LogDocType extends Document {
  userID: string;
  browser: string;
  os: string;
  country: string;
  state: string;
  IP: string;
  device_type: string;
  network_provide: string;
  latitude: string;
  longitude: string;
  date: Date;
}
export interface LogType {
  userID: string;
  browser: string;
  os: string;
  country: string;
  state: string;
  IP: string;
  device_type: string;
  network_provide: string;
  latitude: string;
  longitude: string;
  date: Date;
}

const newlogs: Schema = new Schema({
  browser: {
    type: String,
    required: true,
    lowercase: true,
  },
  os: {
    type: String,
    required: true,
    lowercase: true,
  },
  country: {
    type: String,
    lowercase: true,
  },
  state: {
    type: String,
    lowercase: true,
  },
  IP: {
    type: String,
    required: true,
    lowercase: true,
  },
  device_type: {
    type: String,
    required: true,
    lowercase: true,
  },
  network_provide: {
    type: String,
    lowercase: true,
  },
  latitude: {
    type: String,
    lowercase: true,
  },
  longitude: {
    type: String,
    lowercase: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  userID: {
    type: String,
    required: true,
  },
});

const LogModel: Model<LogDocType, {}> = model("logs", newlogs);

export default LogModel;
