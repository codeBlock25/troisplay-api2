"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var DeviceSchema = new mongoose_1.Schema({
    userID: {
        type: String,
        required: true,
    },
    isDarkMode: {
        type: Boolean,
        required: true,
        default: false,
    },
    remember: {
        type: Boolean,
        required: true,
        default: true,
    },
    online_status: {
        type: Boolean,
        required: true,
        default: true,
    },
    email_notification: {
        type: Boolean,
        required: true,
        default: true,
    },
    app_notification: {
        type: Boolean,
        required: true,
        default: false,
    },
    mobile_notification: {
        type: Boolean,
        required: true,
        default: false,
    },
});
var DeviceModel = mongoose_1.model("device", DeviceSchema);
exports.default = DeviceModel;
