"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    full_name: {
        required: true,
        type: String,
        lowercase: true,
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
    },
    key: {
        type: String,
        required: true,
    },
    date_of_creation: {
        type: Date,
        required: true,
        default: Date.now(),
    },
});
var users = mongoose_1.model("user_account", userSchema);
exports.default = users;
