import { Model, model, Schema, Document } from "mongoose";

export interface deviceType extends Document {
  userID: string;
  isDarkMode: boolean;
  remember: boolean;
  online_status: boolean;
  email_notification: boolean;
  app_notification: boolean;
  mobile_notification: boolean;
}

const DeviceSchema: Schema = new Schema({
  userID: {
    type: String,
    required: true,
  },
  isDarkMode: {
    type: Boolean,
    required: true,
    default: false,
  },
  remember: {
    type: Boolean,
    required: true,
    default: true,
  },
  online_status: {
    type: Boolean,
    required: true,
    default: true,
  },
  email_notification: {
    type: Boolean,
    required: true,
    default: true,
  },
  app_notification: {
    type: Boolean,
    required: true,
    default: false,
  },
  mobile_notification: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const DeviceModel: Model<Document, {}> = model<deviceType>(
  "device",
  DeviceSchema
);

export default DeviceModel;
