"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var VideoSchema = new mongoose_1.Schema({
    link: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
        default: 10,
    },
    date: {
        type: Date,
        required: true,
        default: new Date(),
    },
});
var VideoModel = mongoose_1.model("videolink", VideoSchema);
exports.default = VideoModel;
