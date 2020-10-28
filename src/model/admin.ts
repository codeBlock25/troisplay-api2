import { Model, Document, Schema, model } from "mongoose";

export enum AdminLevel {
  readonly,
  readonly_and_write,
  partial_read,
  partial_write,
  master,
  salave,
}

interface AdminType {
  email: string;
  persmission?: Object;
  password: string;
  date: Date;
  level: AdminLevel;
}
interface AdminDocType extends Document {
  email: string;
  persmission?: Object;
  password: string;
  date: Date;
  level: number;
}

const AdminSchema: Schema<AdminType> = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  persmission: {
    type: Object,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  level: {
    type: AdminLevel,
    required: true,
  },
});

const AdminModel: Model<AdminDocType, {}> = model("admins", AdminSchema);

export default AdminModel;
