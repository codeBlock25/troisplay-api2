"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var admin_1 = tslib_1.__importDefault(require("../model/admin"));
var games_1 = tslib_1.__importStar(require("../model/games"));
var player_1 = tslib_1.__importDefault(require("../model/player"));
var users_1 = tslib_1.__importDefault(require("../model/users"));
var dotenv_1 = require("dotenv");
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
var MonitorRouter = express_1.Router();
MonitorRouter.get("/", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, Admin, players, games, error_1;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                auth = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
                if (!auth) {
                    res.status(401).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token) {
                    res.status(401).json({ message: "error found", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                Admin = _b.sent();
                if (!Admin) {
                    res
                        .status(419)
                        .json({ message: "error found", error: "invalid admin account" });
                    return [2];
                }
                return [4, player_1.default.count({})];
            case 2:
                players = _b.sent();
                return [4, games_1.default.count({
                        gameID: { $not: { $eq: games_1.Games.glory_spin } },
                    })];
            case 3:
                games = _b.sent();
                res.status(200).json({ games: games, players: players });
                return [3, 5];
            case 4:
                error_1 = _b.sent();
                console.error(error_1);
                res.status(500).json({ message: "error found", error: error_1 });
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
MonitorRouter.get("/accounts/data", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, Admin, userslist, admins, error_2;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                auth = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
                if (!auth) {
                    res.status(401).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token) {
                    res.status(401).json({ message: "error found", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                Admin = _b.sent();
                if (!Admin) {
                    res
                        .status(419)
                        .json({ message: "error found", error: "invalid admin account" });
                    return [2];
                }
                return [4, users_1.default.find({})];
            case 2:
                userslist = _b.sent();
                return [4, admin_1.default.find({})];
            case 3:
                admins = _b.sent();
                res
                    .status(200)
                    .json({ message: "content found", users: userslist, admins: admins });
                return [3, 5];
            case 4:
                error_2 = _b.sent();
                console.error(error_2);
                res.status(500).json({ message: "error found", error: error_2 });
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
MonitorRouter.get("/games/data", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, Admin, openGames, closeGames, error_3;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                auth = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
                if (!auth) {
                    res.status(401).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token) {
                    res.status(401).json({ message: "error found", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                Admin = _b.sent();
                if (!Admin) {
                    res
                        .status(419)
                        .json({ message: "error found", error: "invalid admin account" });
                    return [2];
                }
                return [4, games_1.default.count({
                        gameID: { $not: { $eq: games_1.Games.glory_spin } },
                        played: false,
                    })];
            case 2:
                openGames = _b.sent();
                return [4, games_1.default.count({
                        gameID: { $not: { $eq: games_1.Games.glory_spin } },
                        played: true,
                    })];
            case 3:
                closeGames = _b.sent();
                res
                    .status(200)
                    .json({ message: "content found", open: openGames, closed: closeGames });
                return [3, 5];
            case 4:
                error_3 = _b.sent();
                console.error(error_3);
                res.status(500).json({ message: "error found", error: error_3 });
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
exports.default = MonitorRouter;
