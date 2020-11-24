"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ReferalSchema = new mongoose_1.Schema({
    userID: {
        type: String,
        required: true,
        unique: true,
    },
    activeReferal: {
        type: Number,
        required: true,
        default: 0,
    },
    inactiveReferal: {
        type: Number,
        required: true,
        default: 0,
    },
    refer_code: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
});
var ReferalModel = mongoose_1.model("referals", ReferalSchema);
exports.default = ReferalModel;
