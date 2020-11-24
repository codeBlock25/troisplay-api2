"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var enum_1 = require("../types/enum");
var notificationSchema = new mongoose_1.Schema({
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
                type: enum_1.notificationHintType,
                default: enum_1.notificationHintType.win,
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
var notificationModel = mongoose_1.model("notifications", notificationSchema);
exports.default = notificationModel;
