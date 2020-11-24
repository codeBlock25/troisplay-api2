"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var roomSchema = new mongoose_1.Schema({
    room_name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    date: {
        type: Date,
        default: new Date(),
    },
    last_changed: {
        type: Date,
        default: new Date(),
    },
    entry_price: {
        type: Number,
        required: true,
    },
    key_time: {
        type: Number,
        required: true,
    },
    player_limit: {
        type: Number,
        required: true,
    },
    players: {
        type: Array,
        required: true,
        default: [],
    },
    activeMember: {
        type: Number,
        required: true,
        default: 0,
    },
    addedBy: {
        type: String,
        required: true,
    },
});
var roomModel = mongoose_1.model("rooms", roomSchema);
exports.default = roomModel;
