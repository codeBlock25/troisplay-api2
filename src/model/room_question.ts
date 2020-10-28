import { Model, model, Schema, Document } from "mongoose";

export enum AnswerType {
  date,
  bool,
}

export interface QuestionsRoomHint {
  room_name: string;
  questions: {
    question: string;
    answer: string;
    answerType: AnswerType;
    played: boolean;
  }[];
  date: Date;
}

const QuestionsRoom = new Schema({
  room_name: {
    type: String,
    required: true,
  },
  questions: {
    type: Array,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const roomQuestionModel: Model<QuestionsRoomHint & Document, {}> = model(
  "questions",
  QuestionsRoom
);

export default roomQuestionModel;
