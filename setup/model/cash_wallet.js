"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var CashWalletSchema = new mongoose_1.Schema({
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
var CashWalletModel = mongoose_1.model("user_cash_wallet", CashWalletSchema);
exports.default = CashWalletModel;
