"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var newlogs = new mongoose_1.Schema({
    browser: {
        type: String,
        required: true,
        lowercase: true,
    },
    os: {
        type: String,
        required: true,
        lowercase: true,
    },
    country: {
        type: String,
        lowercase: true,
    },
    state: {
        type: String,
        lowercase: true,
    },
    IP: {
        type: String,
        required: true,
        lowercase: true,
    },
    device_type: {
        type: String,
        required: true,
        lowercase: true,
    },
    network_provide: {
        type: String,
        lowercase: true,
    },
    latitude: {
        type: String,
        lowercase: true,
    },
    longitude: {
        type: String,
        lowercase: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    userID: {
        type: String,
        required: true,
    },
});
var LogModel = mongoose_1.model("logs", newlogs);
exports.default = LogModel;
