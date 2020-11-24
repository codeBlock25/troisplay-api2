"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLevel = void 0;
var mongoose_1 = require("mongoose");
var AdminLevel;
(function (AdminLevel) {
    AdminLevel[AdminLevel["readonly"] = 0] = "readonly";
    AdminLevel[AdminLevel["readonly_and_write"] = 1] = "readonly_and_write";
    AdminLevel[AdminLevel["partial_read"] = 2] = "partial_read";
    AdminLevel[AdminLevel["partial_write"] = 3] = "partial_write";
    AdminLevel[AdminLevel["master"] = 4] = "master";
    AdminLevel[AdminLevel["salave"] = 5] = "salave";
})(AdminLevel = exports.AdminLevel || (exports.AdminLevel = {}));
var AdminSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    persmission: {
        type: Object,
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    level: {
        type: AdminLevel,
        required: true,
    },
});
var AdminModel = mongoose_1.model("admins", AdminSchema);
exports.default = AdminModel;
