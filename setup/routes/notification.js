"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var notification_1 = tslib_1.__importDefault(require("../model/notification"));
var users_1 = tslib_1.__importDefault(require("../model/users"));
var notificationRoute = express_1.Router();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
notificationRoute.get("/all", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, error_1;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                auth = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
                if (!auth) {
                    res.status(406).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded.id)];
            case 1:
                found = _b.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, notification_1.default
                        .findOne({ userID: decoded.id })
                        .sort({ date: -1 })
                        .then(function (notifications) {
                        res.json({ notifications: notifications });
                    })
                        .catch(function (error) {
                        res.status(500).json({ error: error, msssage: "error occured" });
                        console.log(error);
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_1 = _b.sent();
                res.status(500).json({ error: error_1, msssage: "breakdown" });
                console.log(error_1);
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
exports.default = notificationRoute;
