"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var WalletSchema = new mongoose_1.Schema({
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
var WalletModel = mongoose_1.model("user_wallet", WalletSchema);
exports.default = WalletModel;
