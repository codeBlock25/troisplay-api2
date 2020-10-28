import { model, Schema, Model, Document } from "mongoose";

export interface cashWalletType extends Document {
  userID: string;
  currentCash: number;
  pendingCash: number;
}

const CashWalletSchema: Schema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  currentCash: {
    type: Number,
    required: true,
    default: 10000,
  },
  pendingCash: {
    type: Number,
    required: true,
    default: 0,
  },
});

const CashWalletModel: Model<cashWalletType, {}> = model<cashWalletType>(
  "user_cash_wallet",
  CashWalletSchema
);

export default CashWalletModel;
