"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerType = void 0;
var mongoose_1 = require("mongoose");
var AnswerType;
(function (AnswerType) {
    AnswerType[AnswerType["date"] = 0] = "date";
    AnswerType[AnswerType["bool"] = 1] = "bool";
})(AnswerType = exports.AnswerType || (exports.AnswerType = {}));
var QuestionsRoom = new mongoose_1.Schema({
    room_name: {
        type: String,
        required: true,
    },
    questions: {
        type: Array,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: new Date(),
    },
});
var roomQuestionModel = mongoose_1.model("questions", QuestionsRoom);
exports.default = roomQuestionModel;
