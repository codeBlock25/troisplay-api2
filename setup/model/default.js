"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var defaultSchema = new mongoose_1.Schema({
    commission_roshambo: {
        type: {
            value: Number,
            value_in: String,
        },
        required: true,
    },
    commission_penalty: {
        type: {
            value: Number,
            value_in: String,
        },
        required: true,
    },
    commission_guess_mater: {
        type: {
            value: Number,
            value_in: String,
        },
        required: true,
    },
    commission_custom_game: {
        type: {
            value: Number,
            value_in: String,
        },
        required: true,
    },
    cashRating: {
        type: Number,
        required: true,
    },
    min_stack_roshambo: {
        type: Number,
        required: true,
    },
    min_stack_penalty: {
        type: Number,
        required: true,
    },
    min_stack_guess_master: {
        type: Number,
        required: true,
    },
    min_stack_custom: {
        type: Number,
        required: true,
    },
    referRating: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: new Date(),
    },
});
var defaultModel = mongoose_1.model("defaults", defaultSchema);
exports.default = defaultModel;
