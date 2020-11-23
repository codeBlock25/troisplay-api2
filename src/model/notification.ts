import { Model, model, Document, Schema } from "mongoose";

export enum notificationType {
  game,
  update,
  silent,
}

export interface NotificationType {
  notifications: {
    message: string;
    time: Date;
    type: notificationType;
    hasNew: boolean;
  }[];
  userID: string;
  date: Date;
}

const notificationSchema = new Schema({
  notifications: [
    {
      message: {
        type: String,
        required: true,
        lowercase: true,
      },
      time: {
        type: Date,
        required: true,
        default: new Date(),
      },
      type: {
        type: notificationType,
        default: notificationType.game,
      },
      hasNew: {
        type: Boolean,
        default: true,
      },
    },
  ],
  userID: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(),
  },
});

const notificationModel: Model<NotificationType & Document, {}> = model(
  "notifications",
  notificationSchema
);

export default notificationModel;
