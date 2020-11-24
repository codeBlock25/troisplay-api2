"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var games_1 = require("./games");
var RecordSchema = new mongoose_1.Schema({
    userID: {
        type: String,
        required: true,
    },
    date_mark: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    game: {
        type: games_1.Games,
        required: true,
        default: 0,
    },
    won: {
        type: String,
        required: true,
        default: 0,
    },
    earnings: {
        type: Number,
        required: true,
        default: 0,
    },
});
var RecordModel = mongoose_1.model("records", RecordSchema);
exports.default = RecordModel;
