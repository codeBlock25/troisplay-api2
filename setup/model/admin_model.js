"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var AdminCashShcema = new mongoose_1.Schema({
    currentCash: {
        type: Number,
        required: true,
        default: 0
    },
    lastpaid: {
        type: Date,
        required: true,
        default: 0
    }
});
var AdminCashModel = mongoose_1.model("admin-cash", AdminCashShcema);
exports.default = AdminCashModel;
