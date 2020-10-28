import { Model, model, Schema, Document } from "mongoose";

export interface VideoHint {
  link: string;
  price: number;
  date: Date;
}

const VideoSchema = new Schema({
  link: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    default: 10,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const VideoModel: Model<Document & VideoHint, {}> = model(
  "videolink",
  VideoSchema
);

export default VideoModel;
