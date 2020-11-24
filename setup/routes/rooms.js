"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var rooms_1 = tslib_1.__importDefault(require("../model/rooms"));
var dotenv_1 = require("dotenv");
var admin_1 = tslib_1.__importDefault(require("../model/admin"));
var room_question_1 = tslib_1.__importDefault(require("../model/room_question"));
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
var RoomRoute = express_1.Router();
RoomRoute.delete("/", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, admin, id, error_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                auth = req.headers.authorization;
                if (!auth) {
                    res.status(406).json({ message: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "invalid auth" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                admin = _a.sent();
                if (!admin) {
                    res.status(406).json({ message: "admin not found" });
                    return [2];
                }
                id = req.query.id;
                return [4, rooms_1.default.deleteOne({ _id: id }).then(function () {
                        res.json({ message: "deleted successfully" });
                    }).catch(function (error) {
                        res.status(500).json({ message: "error", error: error });
                    })];
            case 2:
                _a.sent();
                return [3, 4];
            case 3:
                error_1 = _a.sent();
                res.status(500).json({ error: error_1 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
RoomRoute.post("/", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, admin, _a, entry_price, room_name, key_time, player_limit, error_2;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                auth = req.headers.authorization;
                if (!auth) {
                    res.status(406).json({ message: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "invalid auth" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                admin = _b.sent();
                if (!admin) {
                    res.status(406).json({ message: "admin not found" });
                    return [2];
                }
                _a = req.body, entry_price = _a.entry_price, room_name = _a.room_name, key_time = _a.key_time, player_limit = _a.player_limit;
                return [4, new rooms_1.default({
                        entry_price: entry_price,
                        room_name: room_name,
                        key_time: key_time,
                        player_limit: player_limit,
                        addedBy: decoded.adminID,
                    })
                        .save()
                        .then(function (room) {
                        res.json({ room: room });
                    })
                        .catch(function (error) {
                        if (error.keyPattern.room_name) {
                            res.status(403).json({ error: error });
                            return;
                        }
                        res.status(500).json({ error: error });
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_2 = _b.sent();
                res.status(500).json({ error: error_2 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
RoomRoute.post("/edit", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, admin, _a, entry_price, room_name, key_time, player_limit, id, error_3;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                auth = req.headers.authorization;
                if (!auth) {
                    res.status(406).json({ message: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "invalid auth" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                admin = _b.sent();
                if (!admin) {
                    res.status(406).json({ message: "admin not found" });
                    return [2];
                }
                _a = req.body, entry_price = _a.entry_price, room_name = _a.room_name, key_time = _a.key_time, player_limit = _a.player_limit, id = _a.id;
                return [4, rooms_1.default
                        .updateOne({ _id: id }, {
                        entry_price: entry_price,
                        room_name: room_name,
                        key_time: key_time,
                        player_limit: player_limit,
                    })
                        .then(function () {
                        res.json({ message: "updated" });
                    })
                        .catch(function (error) {
                        res.status(500).json({ error: error });
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_3 = _b.sent();
                res.status(500).json({ error: error_3 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
RoomRoute.post("/add-questions", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, admin, _a, room_name, questions, error_4;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                auth = req.headers.authorization;
                if (!auth) {
                    res.status(406).json({ message: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "invalid auth" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                admin = _b.sent();
                if (!admin) {
                    res.status(406).json({ message: "admin not found" });
                    return [2];
                }
                _a = req.body, room_name = _a.room_name, questions = _a.questions;
                return [4, new room_question_1.default({
                        room_name: room_name,
                        questions: questions,
                    })
                        .save()
                        .then(function () {
                        res.json({ message: "saved" });
                    })
                        .catch(function (error) {
                        res.status(500).json({ error: error });
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_4 = _b.sent();
                res.status(500).json({ error: error_4 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
RoomRoute.get("/", function (_req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, rooms_1.default
                    .find({})
                    .sort({ date: -1 })
                    .then(function (result) {
                    res.json({ rooms: result });
                })
                    .catch(function (error) {
                    res.status(500).json({ error: error });
                })];
            case 1:
                _a.sent();
                return [2];
        }
    });
}); });
exports.default = RoomRoute;
