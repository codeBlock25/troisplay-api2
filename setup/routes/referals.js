"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var referals_1 = tslib_1.__importDefault(require("../model/referals"));
var users_1 = tslib_1.__importDefault(require("../model/users"));
var dotenv_1 = require("dotenv");
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
var ReferalRoute = express_1.Router();
ReferalRoute.put("/up-active", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var cookies, refer_code, token, decoded, found, refel_data, error_1;
    var _a, _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                cookies = req.cookies;
                refer_code = req.query.refer_code;
                if (!cookies) {
                    res.status(410).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = cookies === null || cookies === void 0 ? void 0 : cookies.token;
                if (!token || token === "") {
                    res.status(410).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded.id)];
            case 1:
                found = _c.sent();
                return [4, referals_1.default.findOne({ userID: decoded.id })];
            case 2:
                refel_data = _c.sent();
                if (!found) {
                    res.status(410).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, referals_1.default.updateOne({
                        refer_code: refer_code,
                    }, {
                        activeReferal: ((_a = refel_data === null || refel_data === void 0 ? void 0 : refel_data.activeReferal) !== null && _a !== void 0 ? _a : 0) + 1,
                        inactiveReferal: ((_b = refel_data === null || refel_data === void 0 ? void 0 : refel_data.inactiveReferal) !== null && _b !== void 0 ? _b : 0) - 1,
                    })
                        .then(function (data) {
                        console.log(data);
                    })
                        .catch(function (error) {
                        console.log(error);
                    })
                        .finally(function () {
                        res.json({ message: "done" });
                    })];
            case 3:
                _c.sent();
                return [3, 5];
            case 4:
                error_1 = _c.sent();
                console.log(error_1);
                res.status(503).json({ message: "error found", error: error_1 });
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
ReferalRoute.put("/up-inactive", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var cookies, refer_code, token, decoded, found, refel_data, error_2;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                cookies = req.cookies;
                refer_code = req.query.refer_code;
                if (!cookies) {
                    res.status(410).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = cookies === null || cookies === void 0 ? void 0 : cookies.token;
                if (!token || token === "") {
                    res.status(410).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded.id)];
            case 1:
                found = _a.sent();
                return [4, referals_1.default.findOne({ userID: decoded.id })];
            case 2:
                refel_data = _a.sent();
                if (!found) {
                    res.status(410).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, referals_1.default.updateOne({
                        refer_code: refer_code,
                    }, {
                        inactiveReferal: refel_data.inactiveReferal + 1,
                    })
                        .then(function (data) {
                        console.log(data);
                    })
                        .catch(function (error) {
                        console.log(error);
                    })
                        .finally(function () {
                        res.json({ message: "done" });
                    })];
            case 3:
                _a.sent();
                return [3, 5];
            case 4:
                error_2 = _a.sent();
                console.log(error_2);
                res.status(503).json({ message: "error found", error: error_2 });
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
ReferalRoute.get("/", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        console.log(req.cookies, req.headers.cookie);
        res.send("done");
        return [2];
    });
}); });
exports.default = ReferalRoute;
