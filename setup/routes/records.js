"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dotenv_1 = require("dotenv");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var gamerecord_1 = tslib_1.__importDefault(require("../model/gamerecord"));
var users_1 = tslib_1.__importDefault(require("../model/users"));
var RecordRouter = express_1.Router();
dotenv_1.config();
RecordRouter.get("/", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, user, error_1;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                auth = req.headers.authorization;
                if (!auth) {
                    res.status(403).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token) {
                    res.status(403).json({ message: "error found", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "");
                return [4, users_1.default.findById(decoded.id)];
            case 1:
                user = _b.sent();
                if (!user) {
                    res.status(401).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, gamerecord_1.default.find({ userID: decoded.id })
                        .sort({ date_mark: -1 })
                        .limit(50)
                        .then(function (result) {
                        res.json({ message: "content found", records: result });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_1 = _b.sent();
                res.status(500).json({ message: "error found", error: error_1 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
exports.default = RecordRouter;
