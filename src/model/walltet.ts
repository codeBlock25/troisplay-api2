import { model, Schema, Model, Document } from "mongoose";

export interface walletType extends Document {
  userID: string;
  currentCoin: number;
  pendingCoin: number;
}

const WalletSchema: Schema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  currentCoin: {
    type: Number,
    required: true,
    default: 10000,
  },
  pendingCoin: {
    type: Number,
    required: true,
    default: 0,
  },
});

const WalletModel: Model<walletType, {}> = model<walletType>(
  "user_wallet",
  WalletSchema
);

export default WalletModel;
