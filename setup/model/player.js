"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var player = new mongoose_1.Schema({
    userID: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    playername: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    bank_name: {
        type: String,
        required: true,
        lowercase: true,
    },
    account_number: {
        type: String,
        required: true,
        lowercase: true,
    },
    recovery_question: {
        type: String,
        required: true,
        lowercase: true,
    },
    recovery_answer: {
        type: String,
        required: true,
        lowercase: true,
    },
    playerpic: {
        type: String,
        required: true,
        default: "media/icon.png",
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    location: {
        type: String,
    },
    isConfirmPolicy: {
        type: Boolean,
        required: true,
        default: true,
    },
});
var PlayerModel = mongoose_1.model("players", player);
exports.default = PlayerModel;
