"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var games_1 = tslib_1.__importStar(require("../model/games"));
var users_1 = tslib_1.__importDefault(require("../model/users"));
var moment_1 = tslib_1.__importDefault(require("moment"));
var walltet_1 = tslib_1.__importDefault(require("../model/walltet"));
var gamerecord_1 = tslib_1.__importDefault(require("../model/gamerecord"));
var dotenv_1 = require("dotenv");
var player_1 = tslib_1.__importDefault(require("../model/player"));
var cash_wallet_1 = tslib_1.__importDefault(require("../model/cash_wallet"));
var plays_1 = tslib_1.__importStar(require("../model/plays"));
var admin_1 = tslib_1.__importDefault(require("../model/admin"));
var default_1 = tslib_1.__importDefault(require("../model/default"));
var rooms_1 = tslib_1.__importDefault(require("../model/rooms"));
var admin_model_1 = tslib_1.__importDefault(require("../model/admin_model"));
var enum_1 = require("../types/enum");
var function_1 = require("../function");
var randomstring_1 = require("randomstring");
var lodash_1 = require("lodash");
dotenv_1.config();
var GamesRouter = express_1.Router();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
GamesRouter.delete("/any/cancel", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, gameID, game, defaults, adminCash, cash, commission, error_1;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return tslib_1.__generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 10, , 11]);
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
                found = _k.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                gameID = req.query.gameID;
                return [4, games_1.default.findOne({ _id: gameID })];
            case 2:
                game = _k.sent();
                return [4, default_1.default.findOne()];
            case 3:
                defaults = _k.sent();
                return [4, admin_model_1.default.findOne({})];
            case 4:
                adminCash = _k.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 5:
                cash = _k.sent();
                if (!game) return [3, 8];
                commission = game.gameID === games_1.Games.roshambo
                    ? (_b = defaults === null || defaults === void 0 ? void 0 : defaults.commission_roshambo) !== null && _b !== void 0 ? _b : { value: 20, value_in: "%" } : game.gameID === games_1.Games.penalth_card
                    ? (_c = defaults === null || defaults === void 0 ? void 0 : defaults.commission_penalty) !== null && _c !== void 0 ? _c : { value: 20, value_in: "%" } : game.gameID === games_1.Games.matcher
                    ? (_d = defaults === null || defaults === void 0 ? void 0 : defaults.commission_guess_mater) !== null && _d !== void 0 ? _d : { value: 20, value_in: "%" } : game.gameID === games_1.Games.custom_game
                    ? (_e = defaults === null || defaults === void 0 ? void 0 : defaults.commission_custom_game) !== null && _e !== void 0 ? _e : { value: 20, value_in: "%" } : { value: 20, value_in: "%" };
                function_1.PlayAdmin(commission, game.price_in_value, (_f = adminCash === null || adminCash === void 0 ? void 0 : adminCash.currentCash) !== null && _f !== void 0 ? _f : 10, (_g = defaults === null || defaults === void 0 ? void 0 : defaults.cashRating) !== null && _g !== void 0 ? _g : 10, 1);
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCashLeft(commission, (_h = cash === null || cash === void 0 ? void 0 : cash.currentCash) !== null && _h !== void 0 ? _h : 100, game.price_in_value, 1, (_j = defaults === null || defaults === void 0 ? void 0 : defaults.cashRating) !== null && _j !== void 0 ? _j : 10),
                    })];
            case 6:
                _k.sent();
                return [4, games_1.default.deleteOne({ _id: gameID })
                        .then(function () {
                        res.json({ message: "games cancel." });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                        console.error(error);
                    })];
            case 7:
                _k.sent();
                return [3, 9];
            case 8:
                res.status(400).json({ message: "This game does not exit." });
                _k.label = 9;
            case 9: return [3, 11];
            case 10:
                error_1 = _k.sent();
                res.status(500).json({ message: "error found", error: error_1 });
                console.error(error_1);
                return [3, 11];
            case 11: return [2];
        }
    });
}); });
GamesRouter.post("/spin", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var price_in_coin_1, auth, token, decoded_1, found, foundRecord_1, wallet_1, error_2;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                price_in_coin_1 = req.body.price_in_coin;
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
                decoded_1 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_1.id)];
            case 1:
                found = _b.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, gamerecord_1.default.findOne({
                        userID: decoded_1.id,
                        date_mark: {
                            $gte: new Date(moment_1.default().format("YYYY-MM-DD")),
                        },
                    })];
            case 2:
                foundRecord_1 = _b.sent();
                return [4, walltet_1.default.findOne({ userID: decoded_1.id })];
            case 3:
                wallet_1 = _b.sent();
                return [4, new games_1.default({
                        members: [decoded_1.id],
                        price_in_coin: price_in_coin_1,
                        price_in_value: price_in_coin_1,
                        gameDetail: "A game of glory spin",
                        gameID: games_1.Games.glory_spin,
                        played: true,
                    })
                        .save()
                        .then(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var _a, _b;
                        return tslib_1.__generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _b = (_a = Promise).all;
                                    return [4, walltet_1.default.updateOne({ userID: decoded_1.id }, { currentCoin: price_in_coin_1 + wallet_1.currentCoin }).then(function (_) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                            return tslib_1.__generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!foundRecord_1) return [3, 2];
                                                        return [4, gamerecord_1.default.updateOne({ userID: decoded_1.id }, {
                                                                game_count: foundRecord_1.game_count + 1,
                                                                winings: foundRecord_1.winings + 1,
                                                                earnings: foundRecord_1.earnings + price_in_coin_1,
                                                            })];
                                                    case 1:
                                                        _a.sent();
                                                        return [3, 4];
                                                    case 2: return [4, new gamerecord_1.default({
                                                            userID: decoded_1.id,
                                                            game_count: 1,
                                                            winings: 1,
                                                            earnings: price_in_coin_1,
                                                        }).save()];
                                                    case 3:
                                                        _a.sent();
                                                        _a.label = 4;
                                                    case 4: return [2];
                                                }
                                            });
                                        }); })];
                                case 1:
                                    _b.apply(_a, [[
                                            _c.sent()
                                        ]])
                                        .then(function () {
                                        res.json({ message: "successful" });
                                    })
                                        .catch(function (error) {
                                        res.status(500).json({ message: "error found", error: error });
                                    });
                                    return [2];
                            }
                        });
                    }); })];
            case 4:
                _b.sent();
                return [3, 6];
            case 5:
                error_2 = _b.sent();
                res.status(500).json({ message: "error found", error: error_2 });
                console.error(error_2);
                return [3, 6];
            case 6: return [2];
        }
    });
}); });
GamesRouter.get("/spin/check-time", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, error_3;
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
                return [4, games_1.default.findOne({
                        members: [decoded.id],
                        gameID: games_1.Games.glory_spin,
                        date: { $gte: new Date(moment_1.default().format("YYYY-MM-DD")) },
                    }).then(function (result) {
                        if (!result) {
                            res.json({
                                message: "content found",
                                spin_details: {
                                    currentTime: new Date(),
                                    gameTime: new Date(),
                                    isPlayable: true,
                                },
                            });
                        }
                        else {
                            res.json({
                                message: "content found",
                                spin_details: {
                                    currentTime: new Date(),
                                    gameTime: moment_1.default(result.date).add("23", "h"),
                                    isPlayable: false,
                                },
                            });
                        }
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_3 = _b.sent();
                res.status(500).json({ message: "error found", error: error_3 });
                console.error(error_3);
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
GamesRouter.get("/search", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, _a, price, game, error_4;
    var _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
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
                found = _c.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                _a = req.query, price = _a.price, game = _a.game;
                return [4, games_1.default.findOne({
                        members: { $not: { $eq: decoded.id } },
                        played: false,
                        price_in_coin: parseInt(price, 10),
                        gameID: parseInt(game, 10),
                    })
                        .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, player_1.default.findOne({ userID: result === null || result === void 0 ? void 0 : result.members[0] }).then(function (result2) {
                                        res.json({
                                            message: "content found",
                                            games: {
                                                id: result === null || result === void 0 ? void 0 : result._id,
                                                profilepic: result2 === null || result2 === void 0 ? void 0 : result2.playerpic,
                                                playername: result2 === null || result2 === void 0 ? void 0 : result2.playername,
                                                priceType: result === null || result === void 0 ? void 0 : result.priceType,
                                                price_in_coin: result === null || result === void 0 ? void 0 : result.price_in_coin,
                                                price_in_value: result === null || result === void 0 ? void 0 : result.price_in_value,
                                                date: result === null || result === void 0 ? void 0 : result.date,
                                            },
                                        });
                                    })];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        res.status(404).json({ message: "error found", error: error });
                    })];
            case 2:
                _c.sent();
                return [3, 4];
            case 3:
                error_4 = _c.sent();
                res.status(500).json({ message: "error found", error: error_4 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
GamesRouter.get("/getter", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, _a, min, max, game, error_5;
    var _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
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
                found = _c.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                _a = req.query, min = _a.min, max = _a.max, game = _a.game;
                if (!(game === games_1.Games.roshambo ||
                    game === games_1.Games.penalth_card ||
                    game === games_1.Games.matcher)) return [3, 3];
                return [4, games_1.default.find({
                        members: { $not: { $eq: decoded.id } },
                        played: false,
                        gameID: parseInt(game, 10),
                        price_in_value: max,
                    })
                        .sort({ date: 1 })
                        .limit(15)
                        .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var r;
                        return tslib_1.__generator(this, function (_a) {
                            r = [];
                            result.map(function (resl) {
                                if (resl.gameID === games_1.Games.custom_game) {
                                    r.push(resl);
                                }
                                else {
                                    r.push({
                                        _id: resl._id,
                                        gameMemberCount: resl.gameMemberCount,
                                        members: resl.members,
                                        priceType: resl.priceType,
                                        price_in_value: resl.price_in_value,
                                        gameType: resl.gameType,
                                        price_in_coin: resl.price_in_coin,
                                        gameDetail: resl.gameDetail,
                                        gameID: resl.gameID,
                                        played: resl.played,
                                        date: resl.date,
                                        playCount: resl.playCount,
                                        isComplete: resl.isComplete,
                                    });
                                }
                            });
                            res.json({ games: r });
                            return [2];
                        });
                    }); })
                        .catch(function (error) {
                        res.status(404).json({ message: "error found", error: error });
                    })];
            case 2:
                _c.sent();
                return [3, 5];
            case 3: return [4, games_1.default.find({
                    members: { $not: { $eq: decoded.id } },
                    played: false,
                    gameID: parseInt(game, 10),
                    price_in_value: {
                        $lte: parseInt(max, 10) !== 0 ? parseInt(max, 10) : 10000000000000,
                        $gte: parseInt(min, 10),
                    },
                })
                    .sort({ date: 1 })
                    .limit(15)
                    .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var r;
                    return tslib_1.__generator(this, function (_a) {
                        r = [];
                        result.map(function (resl) {
                            if (resl.gameID === games_1.Games.custom_game) {
                                r.push(resl);
                            }
                            else {
                                r.push({
                                    _id: resl._id,
                                    gameMemberCount: resl.gameMemberCount,
                                    members: resl.members,
                                    priceType: resl.priceType,
                                    price_in_value: resl.price_in_value,
                                    gameType: resl.gameType,
                                    price_in_coin: resl.price_in_coin,
                                    gameDetail: resl.gameDetail,
                                    gameID: resl.gameID,
                                    played: resl.played,
                                    date: resl.date,
                                    playCount: resl.playCount,
                                    isComplete: resl.isComplete,
                                });
                            }
                        });
                        res.json({ games: r });
                        return [2];
                    });
                }); })
                    .catch(function (error) {
                    res.status(404).json({ message: "error found", error: error });
                })];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5: return [3, 7];
            case 6:
                error_5 = _c.sent();
                console.error(error_5);
                res.status(500).json({ message: "error found", error: error_5 });
                return [3, 7];
            case 7: return [2];
        }
    });
}); });
GamesRouter.post("/play", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, gameID, playWith, token, decoded_2, found, game_1, coin_wallet_1, cash_wallet_2, error_6;
    var _b, _c, _d, _e, _f;
    return tslib_1.__generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 9, , 10]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, gameID = _a.gameID, playWith = _a.playWith;
                if (!auth) {
                    res.status(406).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded_2 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_2.id)];
            case 1:
                found = _g.sent();
                return [4, games_1.default.findById(gameID)];
            case 2:
                game_1 = _g.sent();
                return [4, walltet_1.default.findOne({ userID: decoded_2.id })];
            case 3:
                coin_wallet_1 = _g.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded_2.id })];
            case 4:
                cash_wallet_2 = _g.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!(playWith === enum_1.PayType.cash)) return [3, 6];
                if (((_c = cash_wallet_2 === null || cash_wallet_2 === void 0 ? void 0 : cash_wallet_2.currentCash) !== null && _c !== void 0 ? _c : 0) < ((_d = game_1 === null || game_1 === void 0 ? void 0 : game_1.price_in_value) !== null && _d !== void 0 ? _d : 0)) {
                    res
                        .status(401)
                        .json({ message: "error found", error: "insufficient fund" });
                    return [2];
                }
                return [4, games_1.default.findOneAndUpdate({ _id: gameID }, {
                        played: true,
                        members: [game_1 === null || game_1 === void 0 ? void 0 : game_1.members[0], decoded_2.id],
                    })
                        .then(function (_) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var _a, _b;
                        return tslib_1.__generator(this, function (_c) {
                            cash_wallet_1.default.updateOne({ userID: decoded_2.id }, {
                                currentCash: ((_a = cash_wallet_2 === null || cash_wallet_2 === void 0 ? void 0 : cash_wallet_2.currentCash) !== null && _a !== void 0 ? _a : 0) - ((_b = game_1 === null || game_1 === void 0 ? void 0 : game_1.price_in_value) !== null && _b !== void 0 ? _b : 0),
                            })
                                .then(function () {
                                res.json({ message: "play", price: game_1 === null || game_1 === void 0 ? void 0 : game_1.price_in_value });
                            })
                                .catch(function (error) {
                                res.status(500).json({ message: "error found", error: error });
                            });
                            return [2];
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 5:
                _g.sent();
                return [3, 8];
            case 6:
                if (!(playWith === enum_1.PayType.coin)) return [3, 8];
                if (((_e = game_1 === null || game_1 === void 0 ? void 0 : game_1.price_in_coin) !== null && _e !== void 0 ? _e : 0) > ((_f = coin_wallet_1 === null || coin_wallet_1 === void 0 ? void 0 : coin_wallet_1.currentCoin) !== null && _f !== void 0 ? _f : 0)) {
                    res.status(401).json({
                        message: "error found",
                        error: "insufficient fund in your coin account",
                    });
                    return [2];
                }
                return [4, games_1.default.findOneAndUpdate({ _id: gameID }, {
                        played: true,
                        members: [game_1 === null || game_1 === void 0 ? void 0 : game_1.members[0], decoded_2.id],
                    })
                        .then(function (_) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var _a, _b;
                        return tslib_1.__generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4, walltet_1.default.updateOne({ userID: decoded_2.id }, {
                                        currentCoin: ((_a = coin_wallet_1 === null || coin_wallet_1 === void 0 ? void 0 : coin_wallet_1.currentCoin) !== null && _a !== void 0 ? _a : 0) - ((_b = game_1 === null || game_1 === void 0 ? void 0 : game_1.price_in_coin) !== null && _b !== void 0 ? _b : 0),
                                    })
                                        .then(function () {
                                        res.json({
                                            message: "play",
                                            price: game_1 === null || game_1 === void 0 ? void 0 : game_1.price_in_coin,
                                        });
                                    })
                                        .catch(function (error) {
                                        res.status(500).json({ message: "error found", error: error });
                                    })];
                                case 1:
                                    _c.sent();
                                    return [2];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 7:
                _g.sent();
                _g.label = 8;
            case 8: return [3, 10];
            case 9:
                error_6 = _g.sent();
                console.error(error_6);
                res.status(500).json({ message: "error found", error: error_6 });
                return [3, 10];
            case 10: return [2];
        }
    });
}); });
GamesRouter.post("/roshambo", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, price_in_cash, gameInPut, payWith_1, token, decoded_3, found, cashInstance, coinInstance, defaultInstance, currentCash_1, currentCoin_1, cashRating, isExiting, error_7;
    var _b, _c;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, price_in_cash = _a.price_in_cash, gameInPut = _a.gameInPut, payWith_1 = _a.payWith;
                if (!auth) {
                    res.status(406).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded_3 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_3.id)];
            case 1:
                found = _d.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded_3.id })];
            case 2:
                cashInstance = _d.sent();
                return [4, walltet_1.default.findOne({ userID: decoded_3.id })];
            case 3:
                coinInstance = _d.sent();
                return [4, default_1.default.findOne({})];
            case 4:
                defaultInstance = _d.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!coinInstance || !cashInstance || !defaultInstance) {
                    res.status(500).json({ error: "internal error", message: "error found" });
                    return [2];
                }
                currentCash_1 = cashInstance.currentCash;
                currentCoin_1 = coinInstance.currentCoin;
                cashRating = defaultInstance.cashRating;
                return [4, games_1.default.findOne({
                        played: false,
                        price_in_value: price_in_cash,
                        gameID: games_1.Games.roshambo,
                    })];
            case 5:
                isExiting = _d.sent();
                if (payWith_1 === enum_1.PayType.cash) {
                    if (currentCash_1 < price_in_cash) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                if (payWith_1 === enum_1.PayType.coin) {
                    if (currentCoin_1 < price_in_cash * cashRating) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                if (isExiting) {
                    if (isExiting.members[0] !== decoded_3.id) {
                        res
                            .status(404)
                            .json({ message: "is Exiting", id: isExiting._id, isExiting: true });
                        return [2];
                    }
                }
                return [4, new games_1.default({
                        gameMemberCount: 2,
                        members: [decoded_3.id],
                        priceType: "virtual",
                        price_in_coin: (_c = price_in_cash * cashRating) !== null && _c !== void 0 ? _c : 0,
                        price_in_value: price_in_cash,
                        gameDetail: "A roshamo (i.e rock, paper, scriossor) game for two.",
                        gameID: games_1.Games.roshambo,
                        battleScore: { player1: gameInPut },
                    })
                        .save()
                        .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(payWith_1 === enum_1.PayType.cash)) return [3, 2];
                                    return [4, cash_wallet_1.default.updateOne({ userID: decoded_3.id }, {
                                            currentCash: currentCash_1 - result.price_in_value,
                                        })
                                            .then(function () {
                                            res.json({ message: "successful", game: result });
                                        })
                                            .catch(function (error) {
                                            res.status(500).json({ message: "error found", error: error });
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2];
                                case 2:
                                    if (!(payWith_1 === enum_1.PayType.coin)) return [3, 4];
                                    return [4, walltet_1.default.updateOne({ userID: decoded_3.id }, {
                                            currentCoin: currentCoin_1 - result.price_in_coin,
                                        })
                                            .then(function () {
                                            res.json({ message: "successful", game: result });
                                        })
                                            .catch(function (error) {
                                            res.status(500).json({ message: "error found", error: error });
                                        })];
                                case 3:
                                    _a.sent();
                                    return [2];
                                case 4:
                                    res.status(404);
                                    return [2];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 6:
                _d.sent();
                return [3, 8];
            case 7:
                error_7 = _d.sent();
                res.status(500).json({ message: "error found", error: error_7 });
                console.error(error_7);
                return [3, 8];
            case 8: return [2];
        }
    });
}); });
GamesRouter.post("/penalty", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, price_in_cash, gameInPut, payWith_2, token, decoded_4, found, cashInstance, coinInstance, defaultInstance, currentCash_2, currentCoin_2, cashRating, isExiting, error_8;
    var _b, _c;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, price_in_cash = _a.price_in_cash, gameInPut = _a.gameInPut, payWith_2 = _a.payWith;
                if (!auth) {
                    res.status(406).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded_4 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_4.id)];
            case 1:
                found = _d.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded_4.id })];
            case 2:
                cashInstance = _d.sent();
                return [4, walltet_1.default.findOne({ userID: decoded_4.id })];
            case 3:
                coinInstance = _d.sent();
                return [4, default_1.default.findOne({})];
            case 4:
                defaultInstance = _d.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!coinInstance || !cashInstance || !defaultInstance) {
                    res.status(500).json({ error: "internal error", message: "error found" });
                    return [2];
                }
                currentCash_2 = cashInstance.currentCash;
                currentCoin_2 = coinInstance.currentCoin;
                cashRating = defaultInstance.cashRating;
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, games_1.default.findOne({
                        played: false,
                        price_in_value: price_in_cash,
                        gameID: games_1.Games.penalth_card,
                    })];
            case 5:
                isExiting = _d.sent();
                if (payWith_2 === enum_1.PayType.cash) {
                    if (currentCash_2 < price_in_cash) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                if (payWith_2 === enum_1.PayType.coin) {
                    if (currentCoin_2 < price_in_cash * cashRating) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                if (isExiting) {
                    if (isExiting.members[0] !== decoded_4.id) {
                        res
                            .status(404)
                            .json({ message: "is Exiting", id: isExiting._id, isExiting: true });
                        return [2];
                    }
                }
                return [4, new games_1.default({
                        gameMemberCount: 2,
                        members: [decoded_4.id],
                        priceType: "virtual",
                        price_in_coin: (_c = price_in_cash * cashRating) !== null && _c !== void 0 ? _c : 0,
                        price_in_value: price_in_cash,
                        gameDetail: "A penalt card game for two.",
                        gameID: games_1.Games.penalth_card,
                        battleScore: { player1: gameInPut },
                    })
                        .save()
                        .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(payWith_2 === enum_1.PayType.cash)) return [3, 2];
                                    return [4, cash_wallet_1.default.updateOne({ userID: decoded_4.id }, {
                                            currentCash: currentCash_2 - result.price_in_value,
                                        })
                                            .then(function () {
                                            res.json({ message: "successful", game: result });
                                        })
                                            .catch(function (error) {
                                            res.status(500).json({ message: "error found", error: error });
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2];
                                case 2:
                                    if (!(payWith_2 === enum_1.PayType.coin)) return [3, 4];
                                    return [4, walltet_1.default.updateOne({ userID: decoded_4.id }, {
                                            currentCoin: currentCoin_2 - result.price_in_coin,
                                        })
                                            .then(function () {
                                            res.json({ message: "successful", game: result });
                                        })
                                            .catch(function (error) {
                                            res.status(500).json({ message: "error found", error: error });
                                        })];
                                case 3:
                                    _a.sent();
                                    return [2];
                                case 4:
                                    res.status(400);
                                    return [2];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 6:
                _d.sent();
                return [3, 8];
            case 7:
                error_8 = _d.sent();
                res.status(500).json({ message: "error found", error: error_8 });
                console.error(error_8);
                return [3, 8];
            case 8: return [2];
        }
    });
}); });
GamesRouter.post("/guess-master", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, price_in_cash, gameInPut, payWith_3, token, decoded_5, found, cashInstance, coinInstance, defaultInstance, currentCash_3, currentCoin_3, cashRating, isExiting, error_9;
    var _b, _c;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, price_in_cash = _a.price_in_cash, gameInPut = _a.gameInPut, payWith_3 = _a.payWith;
                if (!auth) {
                    res.status(406).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded_5 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_5.id)];
            case 1:
                found = _d.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded_5.id })];
            case 2:
                cashInstance = _d.sent();
                return [4, walltet_1.default.findOne({ userID: decoded_5.id })];
            case 3:
                coinInstance = _d.sent();
                return [4, default_1.default.findOne({})];
            case 4:
                defaultInstance = _d.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!coinInstance || !cashInstance || !defaultInstance) {
                    res.status(500).json({ error: "internal error", message: "error found" });
                    return [2];
                }
                currentCash_3 = cashInstance.currentCash;
                currentCoin_3 = coinInstance.currentCoin;
                cashRating = defaultInstance.cashRating;
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (payWith_3 === enum_1.PayType.cash) {
                    if (price_in_cash > currentCash_3) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                else {
                    if (price_in_cash * cashRating > currentCoin_3) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                return [4, games_1.default.findOne({
                        played: false,
                        price_in_value: price_in_cash,
                        gameID: games_1.Games.matcher,
                    })];
            case 5:
                isExiting = _d.sent();
                if (isExiting) {
                    if (isExiting.members[0] !== decoded_5.id) {
                        res
                            .status(404)
                            .json({ message: "is Exiting", id: isExiting._id, isExiting: true });
                        return [2];
                    }
                }
                return [4, new games_1.default({
                        gameMemberCount: 2,
                        members: [decoded_5.id],
                        priceType: "virtual",
                        price_in_coin: (_c = price_in_cash * cashRating) !== null && _c !== void 0 ? _c : 0,
                        price_in_value: price_in_cash,
                        gameDetail: "A game of guess.",
                        gameID: games_1.Games.matcher,
                        battleScore: { player1: gameInPut },
                    })
                        .save()
                        .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(payWith_3 === enum_1.PayType.cash)) return [3, 2];
                                    return [4, cash_wallet_1.default.updateOne({ userID: decoded_5.id }, {
                                            currentCash: currentCash_3 - result.price_in_value,
                                        })
                                            .then(function () {
                                            res.json({ message: "successful", game: result });
                                        })
                                            .catch(function (error) {
                                            res.status(500).json({ message: "error found", error: error });
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2];
                                case 2:
                                    if (!(payWith_3 === enum_1.PayType.coin)) return [3, 4];
                                    return [4, walltet_1.default.updateOne({ userID: decoded_5.id }, {
                                            currentCoin: currentCoin_3 - result.price_in_coin,
                                        })
                                            .then(function () {
                                            res.json({ message: "successful", game: result });
                                        })
                                            .catch(function (error) {
                                            res.status(500).json({ message: "error found", error: error });
                                        })];
                                case 3:
                                    _a.sent();
                                    return [2];
                                case 4:
                                    res.status(400);
                                    return [2];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 6:
                _d.sent();
                return [3, 8];
            case 7:
                error_9 = _d.sent();
                res.status(500).json({ message: "error found", error: error_9 });
                console.error(error_9);
                return [3, 8];
            case 8: return [2];
        }
    });
}); });
GamesRouter.get("/check", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, user, _a, price, gameID, isExiting, error_10;
    var _b, _c;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                if (!auth) {
                    res.status(406).json({
                        message: "not allowed",
                        error: "invalid auth",
                    });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({
                        message: "not allowed",
                        error: "invalid token",
                    });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, (_c = process.env.SECRET) !== null && _c !== void 0 ? _c : "");
                return [4, users_1.default.findById(decoded.id)];
            case 1:
                user = _d.sent();
                if (!user) {
                    res.status(406).json({
                        message: "not allowed",
                        error: "user not found",
                    });
                    return [2];
                }
                _a = req.query, price = _a.price, gameID = _a.gameID;
                return [4, games_1.default.findOne({
                        played: false,
                        price_in_value: parseInt(price, 10),
                        gameID: parseInt(gameID, 10),
                    })];
            case 2:
                isExiting = _d.sent();
                res.json({
                    message: "is Exiting",
                    gamer_: isExiting
                        ? {
                            _id: isExiting._id,
                            gameMemberCount: isExiting.gameMemberCount,
                            members: isExiting.members,
                            priceType: isExiting.priceType,
                            price_in_coin: isExiting.price_in_coin,
                            price_in_value: isExiting.price_in_value,
                            gameType: isExiting.gameType,
                            gameDetail: isExiting.gameDetail,
                            gameID: isExiting.gameID,
                            played: isExiting.played,
                            date: isExiting.date,
                            playCount: isExiting.playCount,
                        }
                        : null,
                    isExiting: Boolean(isExiting),
                });
                return [3, 4];
            case 3:
                error_10 = _d.sent();
                res.status(500).json({ message: "error found", error: error_10 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
GamesRouter.post("/penalty/challange", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, id, gameInPut_1, payWith, token, decoded, found, game_2, cashInstance, coinInstance, defaultInstance, adminCashInstance, p2CashInstance, p1Cash_1, currentCoin, p2Cash, AdminCurrentCash, cashRating_1, commission_penalty_1, winner, error_11;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    return tslib_1.__generator(this, function (_t) {
        switch (_t.label) {
            case 0:
                _t.trys.push([0, 25, , 26]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, id = _a.id, gameInPut_1 = _a.gameInPut, payWith = _a.payWith;
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
                found = _t.sent();
                return [4, games_1.default.findById(id)];
            case 2:
                game_2 = _t.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 3:
                cashInstance = _t.sent();
                return [4, walltet_1.default.findOne({ userID: decoded.id })];
            case 4:
                coinInstance = _t.sent();
                return [4, default_1.default.findOne({})];
            case 5:
                defaultInstance = _t.sent();
                return [4, admin_model_1.default.findOne({})];
            case 6:
                adminCashInstance = _t.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_2 === null || game_2 === void 0 ? void 0 : game_2.members[0],
                    })];
            case 7:
                p2CashInstance = _t.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!coinInstance ||
                    !cashInstance ||
                    !defaultInstance ||
                    !p2CashInstance ||
                    !adminCashInstance) {
                    res.status(500).json({ error: "internal error", message: "error found" });
                    return [2];
                }
                p1Cash_1 = cashInstance.currentCash;
                currentCoin = coinInstance.currentCoin;
                p2Cash = p2CashInstance.currentCash;
                AdminCurrentCash = adminCashInstance.currentCash;
                cashRating_1 = defaultInstance.cashRating, commission_penalty_1 = defaultInstance.commission_penalty;
                winner = function_1.FindWinnerOnPenalty(game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1, gameInPut_1)
                    ? plays_1.GameRec.lose
                    : plays_1.GameRec.win;
                if (!(payWith === enum_1.PayType.coin)) return [3, 9];
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCoinLeft(commission_penalty_1, currentCoin, (_c = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _c !== void 0 ? _c : 0, 1, cashRating_1),
                    })];
            case 8:
                _t.sent();
                return [3, 11];
            case 9: return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                    currentCash: function_1.PlayerCashLeft(commission_penalty_1, p1Cash_1, (_d = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _d !== void 0 ? _d : 0, 1, cashRating_1),
                })];
            case 10:
                _t.sent();
                _t.label = 11;
            case 11:
                if (!winner) return [3, 17];
                return [4, function_1.NotificationAction.add({
                        message: "you have just won a game from playing a penalty card game and have earned \u20A6 " + ((_e = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _e !== void 0 ? _e : 0) + ".",
                        userID: decoded.id,
                        type: enum_1.notificationHintType.win
                    })];
            case 12:
                _t.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a penalty card game and have lost \u20A6 " + ((_f = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _f !== void 0 ? _f : 0) + ".",
                        userID: (_g = game_2 === null || game_2 === void 0 ? void 0 : game_2.members[0]) !== null && _g !== void 0 ? _g : "",
                        type: enum_1.notificationHintType.lost
                    })];
            case 13:
                _t.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.penalth_card,
                        won: "yes",
                        earnings: function_1.PlayerCash(commission_penalty_1, p1Cash_1, (_h = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _h !== void 0 ? _h : 0, 1, cashRating_1),
                    }).save()];
            case 14:
                _t.sent();
                return [4, new gamerecord_1.default({
                        userID: game_2 === null || game_2 === void 0 ? void 0 : game_2.members[0],
                        game: games_1.Games.penalth_card,
                        won: "no",
                        earnings: -function_1.PlayerCash(commission_penalty_1, p2Cash, (_j = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _j !== void 0 ? _j : 0, 1, cashRating_1),
                    }).save()];
            case 15:
                _t.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCash(commission_penalty_1, p1Cash_1, (_k = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _k !== void 0 ? _k : 0, 1, cashRating_1),
                    })
                        .then(function () {
                        var _a;
                        res.json({
                            message: "you won",
                            winner: plays_1.GameRec.win,
                            battlePlan: game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1,
                            game_result: {
                                round1: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round1) === gameInPut_1.round1
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                                round2: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round2) === gameInPut_1.round2
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                                round3: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round3) === gameInPut_1.round3
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                                round4: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round4) === gameInPut_1.round4
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                                round5: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round5) === gameInPut_1.round5
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                            },
                            price: function_1.PlayerCash(commission_penalty_1, p1Cash_1, (_a = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _a !== void 0 ? _a : 0, 1, cashRating_1),
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 16:
                _t.sent();
                return [3, 23];
            case 17: return [4, function_1.NotificationAction.add({
                    message: "you have just won a game from playing a penalty card game and have earned \u20A6 " + ((_l = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _l !== void 0 ? _l : 0) + ".",
                    userID: (_m = game_2 === null || game_2 === void 0 ? void 0 : game_2.members[0]) !== null && _m !== void 0 ? _m : "",
                    type: enum_1.notificationHintType.win,
                })];
            case 18:
                _t.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a penalty card game and have lost \u20A6 " + ((_o = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _o !== void 0 ? _o : 0) + ".",
                        userID: decoded.id,
                        type: enum_1.notificationHintType.lost
                    })];
            case 19:
                _t.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.penalth_card,
                        won: "no",
                        earnings: -function_1.PlayerCash(commission_penalty_1, p1Cash_1, (_p = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _p !== void 0 ? _p : 0, 1, cashRating_1),
                    }).save()];
            case 20:
                _t.sent();
                return [4, new gamerecord_1.default({
                        userID: game_2 === null || game_2 === void 0 ? void 0 : game_2.members[0],
                        game: games_1.Games.penalth_card,
                        won: "yes",
                        earnings: function_1.PlayerCash(commission_penalty_1, p2Cash, (_q = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _q !== void 0 ? _q : 0, 1, cashRating_1),
                    }).save()];
            case 21:
                _t.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_2 === null || game_2 === void 0 ? void 0 : game_2.members[0] }, {
                        p2Cash: function_1.PlayerCash(commission_penalty_1, p1Cash_1, (_r = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _r !== void 0 ? _r : 0, 1, cashRating_1),
                    })
                        .then(function () {
                        res.json({
                            message: "you lost",
                            winner: plays_1.GameRec.lose,
                            price: 0,
                            battlePlan: game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1,
                            game_result: {
                                round1: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round1) === gameInPut_1.round1
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                                round2: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round2) === gameInPut_1.round2
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                                round3: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round3) === gameInPut_1.round3
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                                round4: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round4) === gameInPut_1.round4
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                                round5: (game_2 === null || game_2 === void 0 ? void 0 : game_2.battleScore.player1.round5) === gameInPut_1.round5
                                    ? plays_1.GameRec.win
                                    : plays_1.GameRec.lose,
                            },
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 22:
                _t.sent();
                _t.label = 23;
            case 23: return [4, function_1.PlayAdmin(commission_penalty_1, (_s = game_2 === null || game_2 === void 0 ? void 0 : game_2.price_in_value) !== null && _s !== void 0 ? _s : 0, AdminCurrentCash, cashRating_1, 2)];
            case 24:
                _t.sent();
                return [3, 26];
            case 25:
                error_11 = _t.sent();
                res.status(500).json({ message: "error found", error: error_11 });
                console.error(error_11);
                return [3, 26];
            case 26: return [2];
        }
    });
}); });
GamesRouter.post("/roshambo/challange", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, id, gameInPut_2, payWith, token, decoded, found, game_3, cashInstance, coinInstance, defaultInstance, adminCashInstance, p2CashInstance, p1Cash_2, p2Cash, currentCoin, AdminCurrentCash, cashRating_2, commission_roshambo_1, winner_1, error_12;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    return tslib_1.__generator(this, function (_0) {
        switch (_0.label) {
            case 0:
                _0.trys.push([0, 32, , 33]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, id = _a.id, gameInPut_2 = _a.gameInPut, payWith = _a.payWith;
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
                found = _0.sent();
                return [4, games_1.default.findById(id)];
            case 2:
                game_3 = _0.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 3:
                cashInstance = _0.sent();
                return [4, walltet_1.default.findOne({ userID: decoded.id })];
            case 4:
                coinInstance = _0.sent();
                return [4, default_1.default.findOne({})];
            case 5:
                defaultInstance = _0.sent();
                return [4, admin_model_1.default.findOne({})];
            case 6:
                adminCashInstance = _0.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0],
                    })];
            case 7:
                p2CashInstance = _0.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!coinInstance ||
                    !cashInstance ||
                    !defaultInstance ||
                    !p2CashInstance ||
                    !adminCashInstance) {
                    res.status(500).json({ error: "internal error", message: "error found" });
                    return [2];
                }
                p1Cash_2 = cashInstance.currentCash;
                p2Cash = p2CashInstance.currentCash;
                currentCoin = coinInstance.currentCoin;
                AdminCurrentCash = adminCashInstance.currentCash;
                cashRating_2 = defaultInstance.cashRating, commission_roshambo_1 = defaultInstance.commission_roshambo;
                winner_1 = function_1.FindWinnerOnRoshambo(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1, gameInPut_2);
                if (!(payWith === enum_1.PayType.coin)) return [3, 9];
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCoinLeft(commission_roshambo_1, currentCoin, (_c = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _c !== void 0 ? _c : 0, 1, cashRating_2),
                    })];
            case 8:
                _0.sent();
                return [3, 11];
            case 9: return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                    currentCash: function_1.PlayerCashLeft(commission_roshambo_1, p1Cash_2, (_d = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _d !== void 0 ? _d : 0, 1, cashRating_2),
                })];
            case 10:
                _0.sent();
                _0.label = 11;
            case 11:
                if (!(winner_1 === plays_1.GameRec.win)) return [3, 17];
                return [4, function_1.NotificationAction.add({
                        message: "you have just won a game from playing a roshambo game and have earned \u20A6 " + ((_e = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _e !== void 0 ? _e : 0) + ".",
                        userID: decoded.id,
                        type: enum_1.notificationHintType.win,
                    })];
            case 12:
                _0.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a roshambo game and have lost \u20A6 " + ((_f = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _f !== void 0 ? _f : 0) + ".",
                        userID: (_g = game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0]) !== null && _g !== void 0 ? _g : "",
                        type: enum_1.notificationHintType.lost,
                    })];
            case 13:
                _0.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.roshambo,
                        won: "yes",
                        earnings: function_1.PlayerCash(commission_roshambo_1, p1Cash_2, (_h = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _h !== void 0 ? _h : 0, 1, cashRating_2),
                    }).save()];
            case 14:
                _0.sent();
                return [4, new gamerecord_1.default({
                        userID: game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0],
                        game: games_1.Games.roshambo,
                        won: "no",
                        earnings: -function_1.PlayerCash(commission_roshambo_1, p2Cash, (_j = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _j !== void 0 ? _j : 0, 1, cashRating_2),
                    }).save()];
            case 15:
                _0.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCash(commission_roshambo_1, p1Cash_2, (_k = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _k !== void 0 ? _k : 0, 1, cashRating_2),
                    })
                        .then(function () {
                        var _a;
                        res.json({
                            message: "you won",
                            winner: winner_1,
                            battlePlan: game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1,
                            game_result: {
                                round1: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round1, gameInPut_2.round1),
                                round2: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round2, gameInPut_2.round2),
                                round3: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round3, gameInPut_2.round3),
                                round4: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round4, gameInPut_2.round4),
                                round5: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round5, gameInPut_2.round5),
                            },
                            price: function_1.PlayerCash(commission_roshambo_1, p1Cash_2, (_a = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _a !== void 0 ? _a : 0, 1, cashRating_2),
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 16:
                _0.sent();
                return [3, 30];
            case 17:
                if (!(winner_1 === plays_1.GameRec.draw)) return [3, 24];
                return [4, function_1.NotificationAction.add({
                        message: "you have just drawn in a game from playing a roshambo game and have recieved \u20A6 " + ((_l = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _l !== void 0 ? _l : 0) + ".",
                        userID: decoded.id,
                        type: enum_1.notificationHintType.draw
                    })];
            case 18:
                _0.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just drawn in a game from playing a roshambo game and have recieved \u20A6 " + ((_m = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _m !== void 0 ? _m : 0) + ".",
                        userID: (_o = game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0]) !== null && _o !== void 0 ? _o : "",
                        type: enum_1.notificationHintType.draw,
                    })];
            case 19:
                _0.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.roshambo,
                        won: "yes",
                        earnings: function_1.PlayerDrawCash(commission_roshambo_1, p1Cash_2, (_p = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _p !== void 0 ? _p : 0, 1, cashRating_2),
                    }).save()];
            case 20:
                _0.sent();
                return [4, new gamerecord_1.default({
                        userID: game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0],
                        game: games_1.Games.roshambo,
                        won: "no",
                        earnings: -function_1.PlayerDrawCash(commission_roshambo_1, p2Cash, (_q = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _q !== void 0 ? _q : 0, 1, cashRating_2),
                    }).save()];
            case 21:
                _0.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0] }, {
                        currentCash: function_1.PlayerDrawCash(commission_roshambo_1, p2Cash, (_r = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _r !== void 0 ? _r : 0, 1, cashRating_2),
                    })];
            case 22:
                _0.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerDrawCash(commission_roshambo_1, p1Cash_2, (_s = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _s !== void 0 ? _s : 0, 1, cashRating_2),
                    })
                        .then(function () {
                        var _a;
                        res.json({
                            message: "you drew",
                            winner: winner_1,
                            battlePlan: game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1,
                            game_result: {
                                round1: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round1, gameInPut_2.round1),
                                round2: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round2, gameInPut_2.round2),
                                round3: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round3, gameInPut_2.round3),
                                round4: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round4, gameInPut_2.round4),
                                round5: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round5, gameInPut_2.round5),
                            },
                            price: function_1.PlayerCash(commission_roshambo_1, p1Cash_2, (_a = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _a !== void 0 ? _a : 0, 1, cashRating_2),
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 23:
                _0.sent();
                return [3, 30];
            case 24: return [4, function_1.NotificationAction.add({
                    message: "you have just won a game from playing a roshambo game and have earned \u20A6 " + ((_t = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _t !== void 0 ? _t : 0) + ".",
                    userID: (_u = game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0]) !== null && _u !== void 0 ? _u : "",
                    type: enum_1.notificationHintType.win,
                })];
            case 25:
                _0.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a roshambo game and have lost \u20A6 " + ((_v = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _v !== void 0 ? _v : 0) + ".",
                        userID: decoded.id,
                        type: enum_1.notificationHintType.win
                    })];
            case 26:
                _0.sent();
                return [4, new gamerecord_1.default({
                        userID: game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0],
                        game: games_1.Games.roshambo,
                        won: "yes",
                        earnings: function_1.PlayerCash(commission_roshambo_1, p2Cash, (_w = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _w !== void 0 ? _w : 0, 1, cashRating_2),
                    }).save()];
            case 27:
                _0.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.roshambo,
                        won: "no",
                        earnings: -function_1.PlayerCash(commission_roshambo_1, p1Cash_2, (_x = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _x !== void 0 ? _x : 0, 1, cashRating_2),
                    }).save()];
            case 28:
                _0.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_3 === null || game_3 === void 0 ? void 0 : game_3.members[0] }, {
                        p1Cash: function_1.PlayerCash(commission_roshambo_1, p2Cash, (_y = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _y !== void 0 ? _y : 0, 1, cashRating_2),
                    })
                        .then(function () {
                        res.json({
                            message: "you lost",
                            winner: winner_1,
                            battlePlan: game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1,
                            price: 0,
                            game_result: {
                                round1: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round1, gameInPut_2.round1),
                                round2: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round2, gameInPut_2.round2),
                                round3: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round3, gameInPut_2.round3),
                                round4: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round4, gameInPut_2.round4),
                                round5: function_1.MarkRoshamboGame(game_3 === null || game_3 === void 0 ? void 0 : game_3.battleScore.player1.round5, gameInPut_2.round5),
                            },
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 29:
                _0.sent();
                _0.label = 30;
            case 30: return [4, function_1.PlayAdmin(commission_roshambo_1, (_z = game_3 === null || game_3 === void 0 ? void 0 : game_3.price_in_value) !== null && _z !== void 0 ? _z : 0, AdminCurrentCash, cashRating_2, 2)];
            case 31:
                _0.sent();
                return [3, 33];
            case 32:
                error_12 = _0.sent();
                res.status(500).json({ message: "error found", error: error_12 });
                console.error(error_12);
                return [3, 33];
            case 33: return [2];
        }
    });
}); });
GamesRouter.post("/matcher/challange", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, id, gameInPut, payWith, token, decoded, found, game_4, cashInstance, coinInstance, defaultInstance, adminCashInstance, p2CashInstance, p1Cash, currentCoin, p2Cash, AdminCurrentCash, cashRating_3, commission_guess_mater_1, winner, count, error_13;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15;
    return tslib_1.__generator(this, function (_16) {
        switch (_16.label) {
            case 0:
                _16.trys.push([0, 45, , 46]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, id = _a.id, gameInPut = _a.gameInPut, payWith = _a.payWith;
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
                found = _16.sent();
                return [4, games_1.default.findById(id)];
            case 2:
                game_4 = _16.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 3:
                cashInstance = _16.sent();
                return [4, walltet_1.default.findOne({ userID: decoded.id })];
            case 4:
                coinInstance = _16.sent();
                return [4, default_1.default.findOne({})];
            case 5:
                defaultInstance = _16.sent();
                return [4, admin_model_1.default.findOne({})];
            case 6:
                adminCashInstance = _16.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0],
                    })];
            case 7:
                p2CashInstance = _16.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!coinInstance ||
                    !cashInstance ||
                    !defaultInstance ||
                    !p2CashInstance ||
                    !adminCashInstance) {
                    res.status(500).json({ error: "internal error", message: "error found" });
                    return [2];
                }
                p1Cash = cashInstance.currentCash;
                currentCoin = coinInstance.currentCoin;
                p2Cash = p2CashInstance.currentCash;
                AdminCurrentCash = adminCashInstance.currentCash;
                cashRating_3 = defaultInstance.cashRating, commission_guess_mater_1 = defaultInstance.commission_guess_mater;
                winner = function_1.FindWinnerOnMatcher(game_4 === null || game_4 === void 0 ? void 0 : game_4.battleScore.player1, gameInPut);
                return [4, plays_1.default.countDocuments({
                        player2ID: decoded.id,
                        gameID: id,
                    })];
            case 8:
                count = _16.sent();
                if (payWith === enum_1.PayType.cash) {
                    if (p1Cash < ((_c = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _c !== void 0 ? _c : 0)) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                else {
                    if (currentCoin < ((_d = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _d !== void 0 ? _d : 0) * cashRating_3) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                if (!(payWith === enum_1.PayType.coin)) return [3, 10];
                return [4, walltet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCoinLeft(commission_guess_mater_1, currentCoin, (_e = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _e !== void 0 ? _e : 0, 1, cashRating_3),
                    })];
            case 9:
                _16.sent();
                return [3, 12];
            case 10: return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                    currentCash: function_1.PlayerCashLeft(commission_guess_mater_1, p1Cash, (_f = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _f !== void 0 ? _f : 0, 1, cashRating_3),
                })];
            case 11:
                _16.sent();
                _16.label = 12;
            case 12:
                if (!winner) return [3, 34];
                if (!(count === 1)) return [3, 19];
                return [4, function_1.NotificationAction.add({
                        message: "you have just won a game from playing a guess master game and have earned \u20A6 " + ((_g = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _g !== void 0 ? _g : 0) * 1 + ".",
                        userID: decoded.id,
                        type: enum_1.notificationHintType.win,
                    })];
            case 13:
                _16.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a guess master game and have earned \u20A6 " + ((_h = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _h !== void 0 ? _h : 0) * 1 + ".",
                        userID: (_j = game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0]) !== null && _j !== void 0 ? _j : "",
                        type: enum_1.notificationHintType.lost
                    })];
            case 14:
                _16.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.matcher,
                        won: "yes",
                        earnings: function_1.PlayerCash(commission_guess_mater_1, 0, ((_k = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _k !== void 0 ? _k : 0) * 1, 2, cashRating_3),
                    }).save()];
            case 15:
                _16.sent();
                return [4, new gamerecord_1.default({
                        userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0],
                        game: games_1.Games.matcher,
                        won: "no",
                        earnings: -function_1.PlayerCash(commission_guess_mater_1, 0, ((_l = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _l !== void 0 ? _l : 0) - ((_m = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _m !== void 0 ? _m : 0) * 1, 2, cashRating_3),
                    }).save()];
            case 16:
                _16.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0] }, {
                        currentCash: function_1.PlayerCash(commission_guess_mater_1, p2Cash, ((_o = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _o !== void 0 ? _o : 0) - ((_p = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _p !== void 0 ? _p : 0) * 1, 2, cashRating_3),
                    })];
            case 17:
                _16.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCash(commission_guess_mater_1, p1Cash, ((_q = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _q !== void 0 ? _q : 0) * 1, 2, cashRating_3),
                    })
                        .then(function () {
                        var _a;
                        res.json({
                            message: "you won",
                            winner: true,
                            price: function_1.PlayerCash(commission_guess_mater_1, 0, ((_a = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _a !== void 0 ? _a : 0) * 1, 2, cashRating_3),
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 18:
                _16.sent();
                return [3, 33];
            case 19:
                if (!(count === 2)) return [3, 26];
                return [4, function_1.NotificationAction.add({
                        message: "you have just won a game from playing a guess master game and have earned " + ((_r = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _r !== void 0 ? _r : 0) * 0.8 + ".",
                        userID: decoded.id,
                    })];
            case 20:
                _16.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a guess master game and have earned " + ((_s = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _s !== void 0 ? _s : 0) * 0.8 + ".",
                        userID: (_t = game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0]) !== null && _t !== void 0 ? _t : "",
                    })];
            case 21:
                _16.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.matcher,
                        won: "yes",
                        earnings: function_1.PlayerCash(commission_guess_mater_1, 0, ((_u = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _u !== void 0 ? _u : 0) * 0.8, 2, cashRating_3),
                    }).save()];
            case 22:
                _16.sent();
                return [4, new gamerecord_1.default({
                        userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0],
                        game: games_1.Games.matcher,
                        won: "no",
                        earnings: -function_1.PlayerCash(commission_guess_mater_1, 0, ((_v = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _v !== void 0 ? _v : 0) - ((_w = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _w !== void 0 ? _w : 0) * 0.8, 2, cashRating_3),
                    }).save()];
            case 23:
                _16.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0] }, {
                        currentCash: function_1.PlayerCash(commission_guess_mater_1, p2Cash, ((_x = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _x !== void 0 ? _x : 0) - ((_y = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _y !== void 0 ? _y : 0) * 0.8, 2, cashRating_3),
                    })];
            case 24:
                _16.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCash(commission_guess_mater_1, p1Cash, ((_z = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _z !== void 0 ? _z : 0) * 0.8, 2, cashRating_3),
                    })
                        .then(function () {
                        var _a;
                        res.json({
                            message: "you won",
                            winner: true,
                            price: function_1.PlayerCash(commission_guess_mater_1, 0, ((_a = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _a !== void 0 ? _a : 0) * 0.8, 2, cashRating_3),
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 25:
                _16.sent();
                return [3, 33];
            case 26: return [4, function_1.NotificationAction.add({
                    message: "you have just won a game from playing a guess master game and have earned " + ((_0 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _0 !== void 0 ? _0 : 0) * 0.6 + ".",
                    userID: decoded.id,
                })];
            case 27:
                _16.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a guess master game and have earned " + ((_1 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _1 !== void 0 ? _1 : 0) * 0.6 + ".",
                        userID: (_2 = game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0]) !== null && _2 !== void 0 ? _2 : "",
                    })];
            case 28:
                _16.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.matcher,
                        won: "yes",
                        earnings: function_1.PlayerCash(commission_guess_mater_1, 0, ((_3 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _3 !== void 0 ? _3 : 0) * 0.6, 2, cashRating_3),
                    }).save()];
            case 29:
                _16.sent();
                return [4, new gamerecord_1.default({
                        userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0],
                        game: games_1.Games.matcher,
                        won: "no",
                        earnings: -function_1.PlayerCash(commission_guess_mater_1, 0, ((_4 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _4 !== void 0 ? _4 : 0) * 0.6, 2, cashRating_3),
                    }).save()];
            case 30:
                _16.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0] }, {
                        currentCash: function_1.PlayerCash(commission_guess_mater_1, p2Cash, ((_5 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _5 !== void 0 ? _5 : 0) - ((_6 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _6 !== void 0 ? _6 : 0) * 0.6, 2, cashRating_3),
                    })];
            case 31:
                _16.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: function_1.PlayerCash(commission_guess_mater_1, p1Cash, ((_7 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _7 !== void 0 ? _7 : 0) * 0.6, 2, cashRating_3),
                    })
                        .then(function () {
                        var _a;
                        res.json({
                            message: "you won",
                            winner: true,
                            price: function_1.PlayerCash(commission_guess_mater_1, 0, ((_a = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _a !== void 0 ? _a : 0) * 0.6, 2, cashRating_3),
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 32:
                _16.sent();
                _16.label = 33;
            case 33: return [3, 42];
            case 34: return [4, function_1.NotificationAction.add({
                    message: "you have just won a game from playing a guess master game and have earned " + ((_8 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _8 !== void 0 ? _8 : 0) * 1 + ".",
                    userID: (_9 = game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0]) !== null && _9 !== void 0 ? _9 : "",
                })];
            case 35:
                _16.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a guess master game and have earned " + ((_10 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _10 !== void 0 ? _10 : 0) * 1 + ".",
                        userID: decoded.id,
                    })];
            case 36:
                _16.sent();
                return [4, new plays_1.default({
                        player2ID: decoded.id,
                        isWin: false,
                        gameID: id,
                    }).save()];
            case 37:
                _16.sent();
                if (!(count >= 3)) return [3, 41];
                return [4, new gamerecord_1.default({
                        userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0],
                        game: games_1.Games.matcher,
                        won: "yes",
                        earnings: function_1.PlayerCash(commission_guess_mater_1, 0, (_11 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _11 !== void 0 ? _11 : 0, 1, cashRating_3),
                    }).save()];
            case 38:
                _16.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.matcher,
                        won: "no",
                        earnings: -function_1.PlayerCash(commission_guess_mater_1, 0, (_12 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _12 !== void 0 ? _12 : 0, 1, cashRating_3),
                    }).save()];
            case 39:
                _16.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_4 === null || game_4 === void 0 ? void 0 : game_4.members[0] }, {
                        currentCash: function_1.PlayerCash(commission_guess_mater_1, p2Cash, (_13 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _13 !== void 0 ? _13 : 0, 2, cashRating_3),
                    })
                        .then(function () {
                        res.json({
                            message: "you lost",
                            winner: false,
                            price: 0,
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 40:
                _16.sent();
                return [3, 42];
            case 41:
                res.json({ count: 4 - count, winner: false, price: 0 });
                _16.label = 42;
            case 42: return [4, games_1.default.updateOne({
                    _id: (_14 = game_4 === null || game_4 === void 0 ? void 0 : game_4._id) !== null && _14 !== void 0 ? _14 : "",
                }, {
                    played: true,
                })];
            case 43:
                _16.sent();
                return [4, function_1.PlayAdmin(commission_guess_mater_1, (_15 = game_4 === null || game_4 === void 0 ? void 0 : game_4.price_in_value) !== null && _15 !== void 0 ? _15 : 0, AdminCurrentCash, cashRating_3, 2)];
            case 44:
                _16.sent();
                return [3, 46];
            case 45:
                error_13 = _16.sent();
                res.status(500).json({ message: "error found", error: error_13 });
                console.error(error_13);
                return [3, 46];
            case 46: return [2];
        }
    });
}); });
GamesRouter.get("/mine", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, roomgames_1, customgames_1, error_14;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
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
                return [4, rooms_1.default.find({ players: [decoded.id] })];
            case 2:
                roomgames_1 = _b.sent();
                return [4, games_1.default.find({
                        members: decoded.id,
                        gameID: games_1.Games.custom_game,
                        isComplete: false,
                        played: true,
                    })];
            case 3:
                customgames_1 = _b.sent();
                return [4, games_1.default.find({
                        played: false,
                        gameID: { $not: { $eq: games_1.Games.custom_game } },
                        members: decoded.id,
                    })
                        .sort({ date: -1 })
                        .limit(45)
                        .then(function (result) {
                        var games = [];
                        roomgames_1.map(function (g) {
                            games.push({
                                date: g.date,
                                gameDetail: g.room_name,
                                gameID: games_1.Games.rooms,
                                gameMemberCount: g.activeMember,
                                gameType: "Rooms",
                                members: g.players,
                                playCount: 0,
                                price_in_coin: g.key_time,
                                price_in_value: g.entry_price,
                                _id: g._id,
                            });
                        });
                        var allGames = lodash_1.concat(result, customgames_1);
                        allGames.map(function (rels) {
                            if (rels.gameID === games_1.Games.custom_game) {
                                games.push(rels);
                            }
                            else {
                                games.push({
                                    date: rels.date,
                                    gameDetail: rels.gameDetail,
                                    gameID: rels.gameID,
                                    gameMemberCount: rels.gameMemberCount,
                                    gameType: rels.gameType,
                                    members: rels.members,
                                    playCount: rels.playCount,
                                    price_in_coin: rels.price_in_coin,
                                    price_in_value: rels.price_in_value,
                                    _id: rels._id,
                                });
                            }
                        });
                        res.json({
                            message: "content found",
                            games: lodash_1.sortBy(games, { date: 1 }),
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 4:
                _b.sent();
                return [3, 6];
            case 5:
                error_14 = _b.sent();
                res.status(500).json({ message: "error found", error: error_14 });
                console.error(error_14);
                return [3, 6];
            case 6: return [2];
        }
    });
}); });
GamesRouter.post("/roshambo/challange/one-on-one", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, id, gameInPut, round, payWith, token, decoded, found, game_, cashInstance, coinInstance, defaultInstance, adminCashInstance, p2CashInstance, p1Cash, currentCoin, p2Cash, cashRating, commission_roshambo, winCount, loseCount, drawCount, error_15;
    var _b, _c, _d, _e;
    return tslib_1.__generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 28, , 29]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, id = _a.id, gameInPut = _a.gameInPut, round = _a.round, payWith = _a.payWith;
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
                found = _f.sent();
                return [4, games_1.default.findById(id)];
            case 2:
                game_ = _f.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 3:
                cashInstance = _f.sent();
                return [4, walltet_1.default.findOne({ userID: decoded.id })];
            case 4:
                coinInstance = _f.sent();
                return [4, default_1.default.findOne({})];
            case 5:
                defaultInstance = _f.sent();
                return [4, admin_model_1.default.findOne({})];
            case 6:
                adminCashInstance = _f.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                    })];
            case 7:
                p2CashInstance = _f.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!coinInstance ||
                    !cashInstance ||
                    !defaultInstance ||
                    !p2CashInstance ||
                    !adminCashInstance) {
                    res
                        .status(500)
                        .json({ error: "internal error", message: "error found" });
                    return [2];
                }
                if (!game_) {
                    res.status(401).json({
                        message: "error found",
                        error: "invalid game",
                    });
                    return [2];
                }
                p1Cash = cashInstance.currentCash;
                currentCoin = coinInstance.currentCoin;
                p2Cash = p2CashInstance.currentCash;
                cashRating = defaultInstance.cashRating, commission_roshambo = defaultInstance.commission_roshambo;
                if (payWith === enum_1.PayType.coin) {
                    if (game_.price_in_coin > currentCoin) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                else {
                    if (game_.price_in_value > p1Cash) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                return [4, new plays_1.default({
                        player2ID: decoded.id,
                        isWin: function_1.MarkRoshamboGame(game_.battleScore.player1["round" + round], gameInPut),
                        gameID: id,
                    }).save()];
            case 8:
                _f.sent();
                return [4, plays_1.default.countDocuments({
                        player2ID: decoded.id,
                        gameID: id,
                        isWin: plays_1.GameRec.win,
                    })];
            case 9:
                winCount = _f.sent();
                return [4, plays_1.default.countDocuments({
                        player2ID: decoded.id,
                        gameID: id,
                        isWin: plays_1.GameRec.lose,
                    })];
            case 10:
                loseCount = _f.sent();
                return [4, plays_1.default.countDocuments({
                        player2ID: decoded.id,
                        gameID: id,
                        isWin: plays_1.GameRec.draw,
                    })];
            case 11:
                drawCount = _f.sent();
                if (!(drawCount >= 5)) return [3, 18];
                return [4, function_1.NotificationAction.add({
                        message: "you have just won a game from playing a roshambo game and have earned " + ((_c = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _c !== void 0 ? _c : 0) + ".",
                        userID: decoded.id,
                    })];
            case 12:
                _f.sent();
                return [4, function_1.NotificationAction.add({
                        message: "you have just lost a game from playing a roshambo game and have lost " + ((_d = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _d !== void 0 ? _d : 0) + ".",
                        userID: (_e = game_ === null || game_ === void 0 ? void 0 : game_.members[0]) !== null && _e !== void 0 ? _e : "",
                    })];
            case 13:
                _f.sent();
                return [4, new gamerecord_1.default({
                        userID: game_.members[0],
                        game: games_1.Games.roshambo,
                        won: "draw",
                        earnings: -(commission_roshambo.value_in === "$"
                            ? game_.price_in_value +
                                (game_.price_in_value - commission_roshambo.value)
                            : commission_roshambo.value_in === "c"
                                ? game_.price_in_value +
                                    (game_.price_in_value - cashRating * commission_roshambo.value)
                                : commission_roshambo.value_in === "%"
                                    ? game_.price_in_value +
                                        (game_.price_in_value -
                                            game_.price_in_value / commission_roshambo.value)
                                    : 0),
                    }).save()];
            case 14:
                _f.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.roshambo,
                        won: "draw",
                        earnings: -(commission_roshambo.value_in === "$"
                            ? game_.price_in_value +
                                (game_.price_in_value - commission_roshambo.value)
                            : commission_roshambo.value_in === "c"
                                ? game_.price_in_value +
                                    (game_.price_in_value - cashRating * commission_roshambo.value)
                                : commission_roshambo.value_in === "%"
                                    ? game_.price_in_value +
                                        (game_.price_in_value -
                                            game_.price_in_value / commission_roshambo.value)
                                    : 0),
                    }).save()];
            case 15:
                _f.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: p1Cash +
                            (commission_roshambo.value_in === "$"
                                ? game_.price_in_value - commission_roshambo.value
                                : commission_roshambo.value_in === "c"
                                    ? game_.price_in_value - cashRating * commission_roshambo.value
                                    : commission_roshambo.value_in === "%"
                                        ? game_.price_in_value -
                                            game_.price_in_value / commission_roshambo.value
                                        : 0),
                    })];
            case 16:
                _f.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_.members[0] }, {
                        currentCash: p2Cash +
                            (commission_roshambo.value_in === "$"
                                ? game_.price_in_value - commission_roshambo.value
                                : commission_roshambo.value_in === "c"
                                    ? game_.price_in_value - cashRating * commission_roshambo.value
                                    : commission_roshambo.value_in === "%"
                                        ? game_.price_in_value -
                                            game_.price_in_value / commission_roshambo.value
                                        : 0),
                    })];
            case 17:
                _f.sent();
                res.json({
                    winner: function_1.MarkRoshamboGame(game_.battleScore.player1["round" + round], gameInPut),
                    price: commission_roshambo.value_in === "$"
                        ? game_.price_in_value +
                            (game_.price_in_value - commission_roshambo.value)
                        : commission_roshambo.value_in === "c"
                            ? game_.price_in_value +
                                (game_.price_in_value - cashRating * commission_roshambo.value)
                            : commission_roshambo.value_in === "%"
                                ? game_.price_in_value +
                                    (game_.price_in_value -
                                        game_.price_in_value / commission_roshambo.value)
                                : 0,
                    final: "draw",
                    finalWin: true,
                });
                return [2];
            case 18:
                if (!(winCount >= 3 ||
                    (drawCount >= 4 && winCount >= 1) ||
                    (drawCount >= 3 && winCount >= 2))) return [3, 22];
                return [4, new gamerecord_1.default({
                        userID: game_.members[0],
                        game: games_1.Games.roshambo,
                        won: "no",
                        earnings: -(commission_roshambo.value_in === "$"
                            ? game_.price_in_value +
                                (game_.price_in_value - commission_roshambo.value)
                            : commission_roshambo.value_in === "c"
                                ? game_.price_in_value +
                                    (game_.price_in_value - cashRating * commission_roshambo.value)
                                : commission_roshambo.value_in === "%"
                                    ? game_.price_in_value +
                                        (game_.price_in_value -
                                            game_.price_in_value / commission_roshambo.value)
                                    : 0),
                    }).save()];
            case 19:
                _f.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.roshambo,
                        won: "yes",
                        earnings: commission_roshambo.value_in === "$"
                            ? game_.price_in_value +
                                (game_.price_in_value - commission_roshambo.value)
                            : commission_roshambo.value_in === "c"
                                ? game_.price_in_value +
                                    (game_.price_in_value - cashRating * commission_roshambo.value)
                                : commission_roshambo.value_in === "%"
                                    ? game_.price_in_value +
                                        (game_.price_in_value -
                                            game_.price_in_value / commission_roshambo.value)
                                    : 0,
                    }).save()];
            case 20:
                _f.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, {
                        currentCash: p1Cash +
                            (commission_roshambo.value_in === "$"
                                ? game_.price_in_value +
                                    (game_.price_in_value - commission_roshambo.value)
                                : commission_roshambo.value_in === "c"
                                    ? game_.price_in_value +
                                        (game_.price_in_value -
                                            cashRating * commission_roshambo.value)
                                    : commission_roshambo.value_in === "%"
                                        ? game_.price_in_value +
                                            (game_.price_in_value -
                                                game_.price_in_value / commission_roshambo.value)
                                        : 0),
                    })];
            case 21:
                _f.sent();
                res.json({
                    winner: function_1.MarkRoshamboGame(game_.battleScore.player1["round" + round], gameInPut),
                    price: commission_roshambo.value_in === "$"
                        ? game_.price_in_value +
                            (game_.price_in_value - commission_roshambo.value)
                        : commission_roshambo.value_in === "c"
                            ? game_.price_in_value +
                                (game_.price_in_value - cashRating * commission_roshambo.value)
                            : commission_roshambo.value_in === "%"
                                ? game_.price_in_value +
                                    (game_.price_in_value -
                                        game_.price_in_value / commission_roshambo.value)
                                : 0,
                    final: "won",
                    finalWin: true,
                });
                return [2];
            case 22:
                if (!(loseCount >= 3 ||
                    (drawCount >= 4 && loseCount >= 1) ||
                    (drawCount >= 3 && loseCount >= 2))) return [3, 26];
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.roshambo,
                        won: "no",
                        earnings: -(commission_roshambo.value_in === "$"
                            ? game_.price_in_value +
                                (game_.price_in_value - commission_roshambo.value)
                            : commission_roshambo.value_in === "c"
                                ? game_.price_in_value +
                                    (game_.price_in_value - cashRating * commission_roshambo.value)
                                : commission_roshambo.value_in === "%"
                                    ? game_.price_in_value +
                                        (game_.price_in_value -
                                            game_.price_in_value / commission_roshambo.value)
                                    : 0),
                    }).save()];
            case 23:
                _f.sent();
                return [4, new gamerecord_1.default({
                        userID: game_.members[0],
                        game: games_1.Games.roshambo,
                        won: "yes",
                        earnings: commission_roshambo.value_in === "$"
                            ? game_.price_in_value +
                                (game_.price_in_value - commission_roshambo.value)
                            : commission_roshambo.value_in === "c"
                                ? game_.price_in_value +
                                    (game_.price_in_value - cashRating * commission_roshambo.value)
                                : commission_roshambo.value_in === "%"
                                    ? game_.price_in_value +
                                        (game_.price_in_value -
                                            game_.price_in_value / commission_roshambo.value)
                                    : 0,
                    }).save()];
            case 24:
                _f.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_.members[0] }, {
                        currentCash: p2Cash +
                            (commission_roshambo.value_in === "$"
                                ? game_.price_in_value +
                                    (game_.price_in_value - commission_roshambo.value)
                                : commission_roshambo.value_in === "c"
                                    ? game_.price_in_value +
                                        (game_.price_in_value -
                                            cashRating * commission_roshambo.value)
                                    : commission_roshambo.value_in === "%"
                                        ? game_.price_in_value +
                                            (game_.price_in_value -
                                                game_.price_in_value / commission_roshambo.value)
                                        : 0),
                    })];
            case 25:
                _f.sent();
                res.json({
                    winner: function_1.MarkRoshamboGame(game_.battleScore.player1["round" + round], gameInPut),
                    price: 0,
                    final: "lost",
                    finalWin: false,
                });
                return [2];
            case 26:
                res.json({
                    winner: function_1.MarkRoshamboGame(game_.battleScore.player1["round" + round], gameInPut),
                    price: 0,
                    final: "no",
                });
                _f.label = 27;
            case 27: return [3, 29];
            case 28:
                error_15 = _f.sent();
                res.status(500).json({ message: "error found", error: error_15 });
                console.error(error_15);
                return [3, 29];
            case 29: return [2];
        }
    });
}); });
GamesRouter.post("/penalty/challange/one-on-one", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, _a, id_1, gameInPut_3, round_1, payWith, token, decoded_6, found, game_5, cashInstance, coinInstance, defaultInstance, adminCashInstance, p2CashInstance, p1Cash_3, currentCoin, p2Cash_1, cashRating_4, commission_penalty_2, error_16;
    var _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 9, , 10]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                _a = req.body, id_1 = _a.id, gameInPut_3 = _a.gameInPut, round_1 = _a.round, payWith = _a.payWith;
                if (!auth) {
                    res.status(406).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded_6 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_6.id)];
            case 1:
                found = _c.sent();
                return [4, games_1.default.findById(id_1)];
            case 2:
                game_5 = _c.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded_6.id })];
            case 3:
                cashInstance = _c.sent();
                return [4, walltet_1.default.findOne({ userID: decoded_6.id })];
            case 4:
                coinInstance = _c.sent();
                return [4, default_1.default.findOne({})];
            case 5:
                defaultInstance = _c.sent();
                return [4, admin_model_1.default.findOne({})];
            case 6:
                adminCashInstance = _c.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_5 === null || game_5 === void 0 ? void 0 : game_5.members[0],
                    })];
            case 7:
                p2CashInstance = _c.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (!coinInstance ||
                    !cashInstance ||
                    !defaultInstance ||
                    !p2CashInstance ||
                    !adminCashInstance ||
                    !game_5) {
                    res
                        .status(500)
                        .json({ error: "internal error", message: "error found" });
                    return [2];
                }
                p1Cash_3 = cashInstance.currentCash;
                currentCoin = coinInstance.currentCoin;
                p2Cash_1 = p2CashInstance.currentCash;
                cashRating_4 = defaultInstance.cashRating, commission_penalty_2 = defaultInstance.commission_penalty;
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                if (payWith === enum_1.PayType.coin) {
                    if (game_5.price_in_coin > currentCoin) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                else {
                    if (game_5.price_in_value > p1Cash_3) {
                        res
                            .status(401)
                            .json({ message: "error found", error: "insufficient fund" });
                        return [2];
                    }
                }
                return [4, games_1.default.findOne({ _id: id_1 })
                        .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var winCount, loseCount;
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24;
                        return tslib_1.__generator(this, function (_25) {
                            switch (_25.label) {
                                case 0: return [4, new plays_1.default({
                                        player2ID: decoded_6.id,
                                        isWin: (result === null || result === void 0 ? void 0 : result.battleScore.player1["round" + round_1]) === gameInPut_3,
                                        gameID: result === null || result === void 0 ? void 0 : result._id,
                                    }).save()];
                                case 1:
                                    _25.sent();
                                    return [4, plays_1.default.countDocuments({
                                            player2ID: decoded_6.id,
                                            gameID: id_1,
                                            isWin: true,
                                        })];
                                case 2:
                                    winCount = _25.sent();
                                    return [4, plays_1.default.countDocuments({
                                            player2ID: decoded_6.id,
                                            gameID: id_1,
                                            isWin: false,
                                        })];
                                case 3:
                                    loseCount = _25.sent();
                                    if (!(winCount >= 3)) return [3, 7];
                                    return [4, new gamerecord_1.default({
                                            userID: game_5 === null || game_5 === void 0 ? void 0 : game_5.members[0],
                                            game: games_1.Games.penalth_card,
                                            won: "no",
                                            earnings: -(commission_penalty_2.value_in === "$"
                                                ? ((_a = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _a !== void 0 ? _a : 0) +
                                                    (((_b = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _b !== void 0 ? _b : 0) - commission_penalty_2.value)
                                                : commission_penalty_2.value_in === "c"
                                                    ? ((_c = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _c !== void 0 ? _c : 0) +
                                                        (((_d = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _d !== void 0 ? _d : 0) -
                                                            cashRating_4 * commission_penalty_2.value)
                                                    : commission_penalty_2.value_in === "%"
                                                        ? ((_e = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _e !== void 0 ? _e : 0) +
                                                            (((_f = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _f !== void 0 ? _f : 0) -
                                                                ((_g = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _g !== void 0 ? _g : 0) / commission_penalty_2.value)
                                                        : 0),
                                        }).save()];
                                case 4:
                                    _25.sent();
                                    return [4, new gamerecord_1.default({
                                            userID: decoded_6.id,
                                            game: games_1.Games.penalth_card,
                                            won: "yes",
                                            earnings: commission_penalty_2.value_in === "$"
                                                ? ((_h = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _h !== void 0 ? _h : 0) +
                                                    (((_j = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _j !== void 0 ? _j : 0) - commission_penalty_2.value)
                                                : commission_penalty_2.value_in === "c"
                                                    ? ((_k = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _k !== void 0 ? _k : 0) +
                                                        (((_l = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _l !== void 0 ? _l : 0) -
                                                            cashRating_4 * commission_penalty_2.value)
                                                    : commission_penalty_2.value_in === "%"
                                                        ? ((_m = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _m !== void 0 ? _m : 0) +
                                                            (((_o = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _o !== void 0 ? _o : 0) -
                                                                ((_p = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _p !== void 0 ? _p : 0) / commission_penalty_2.value)
                                                        : 0,
                                        }).save()];
                                case 5:
                                    _25.sent();
                                    return [4, cash_wallet_1.default.updateOne({ userID: decoded_6.id }, {
                                            currentCash: p1Cash_3 +
                                                (commission_penalty_2.value_in === "$"
                                                    ? ((_q = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _q !== void 0 ? _q : 0) +
                                                        (((_r = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _r !== void 0 ? _r : 0) - commission_penalty_2.value)
                                                    : commission_penalty_2.value_in === "c"
                                                        ? ((_s = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _s !== void 0 ? _s : 0) +
                                                            (((_t = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _t !== void 0 ? _t : 0) -
                                                                cashRating_4 * commission_penalty_2.value)
                                                        : commission_penalty_2.value_in === "%"
                                                            ? ((_u = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _u !== void 0 ? _u : 0) +
                                                                (((_v = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _v !== void 0 ? _v : 0) -
                                                                    ((_w = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _w !== void 0 ? _w : 0) / commission_penalty_2.value)
                                                            : 0),
                                        })];
                                case 6:
                                    _25.sent();
                                    res.json({
                                        winner: (game_5 === null || game_5 === void 0 ? void 0 : game_5.battleScore.player1["round" + round_1]) === gameInPut_3,
                                        price: commission_penalty_2.value_in === "$"
                                            ? ((_x = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _x !== void 0 ? _x : 0) +
                                                (((_y = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _y !== void 0 ? _y : 0) - commission_penalty_2.value)
                                            : commission_penalty_2.value_in === "c"
                                                ? ((_z = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _z !== void 0 ? _z : 0) +
                                                    (((_0 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _0 !== void 0 ? _0 : 0) -
                                                        cashRating_4 * commission_penalty_2.value)
                                                : commission_penalty_2.value_in === "%"
                                                    ? ((_1 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _1 !== void 0 ? _1 : 0) +
                                                        (((_2 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _2 !== void 0 ? _2 : 0) -
                                                            ((_3 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _3 !== void 0 ? _3 : 0) / commission_penalty_2.value)
                                                    : 0,
                                        final: true,
                                        finalWin: true,
                                    });
                                    return [2];
                                case 7:
                                    if (!(loseCount >= 3)) return [3, 11];
                                    return [4, new gamerecord_1.default({
                                            userID: decoded_6.id,
                                            game: games_1.Games.penalth_card,
                                            won: "no",
                                            earnings: -(commission_penalty_2.value_in === "$"
                                                ? ((_4 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _4 !== void 0 ? _4 : 0) +
                                                    (((_5 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _5 !== void 0 ? _5 : 0) - commission_penalty_2.value)
                                                : commission_penalty_2.value_in === "c"
                                                    ? ((_6 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _6 !== void 0 ? _6 : 0) +
                                                        (((_7 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _7 !== void 0 ? _7 : 0) -
                                                            cashRating_4 * commission_penalty_2.value)
                                                    : commission_penalty_2.value_in === "%"
                                                        ? ((_8 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _8 !== void 0 ? _8 : 0) +
                                                            (((_9 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _9 !== void 0 ? _9 : 0) -
                                                                ((_10 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _10 !== void 0 ? _10 : 0) / commission_penalty_2.value)
                                                        : 0),
                                        }).save()];
                                case 8:
                                    _25.sent();
                                    return [4, new gamerecord_1.default({
                                            userID: game_5 === null || game_5 === void 0 ? void 0 : game_5.members[0],
                                            game: games_1.Games.penalth_card,
                                            won: "yes",
                                            earnings: commission_penalty_2.value_in === "$"
                                                ? ((_11 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _11 !== void 0 ? _11 : 0) +
                                                    (((_12 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _12 !== void 0 ? _12 : 0) - commission_penalty_2.value)
                                                : commission_penalty_2.value_in === "c"
                                                    ? ((_13 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _13 !== void 0 ? _13 : 0) +
                                                        (((_14 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _14 !== void 0 ? _14 : 0) -
                                                            cashRating_4 * commission_penalty_2.value)
                                                    : commission_penalty_2.value_in === "%"
                                                        ? ((_15 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _15 !== void 0 ? _15 : 0) +
                                                            (((_16 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _16 !== void 0 ? _16 : 0) -
                                                                ((_17 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _17 !== void 0 ? _17 : 0) / commission_penalty_2.value)
                                                        : 0,
                                        }).save()];
                                case 9:
                                    _25.sent();
                                    return [4, cash_wallet_1.default.updateOne({ userID: game_5 === null || game_5 === void 0 ? void 0 : game_5.members[0] }, {
                                            currentCash: p2Cash_1 +
                                                (commission_penalty_2.value_in === "$"
                                                    ? ((_18 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _18 !== void 0 ? _18 : 0) +
                                                        (((_19 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _19 !== void 0 ? _19 : 0) - commission_penalty_2.value)
                                                    : commission_penalty_2.value_in === "c"
                                                        ? ((_20 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _20 !== void 0 ? _20 : 0) +
                                                            (((_21 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _21 !== void 0 ? _21 : 0) -
                                                                cashRating_4 * commission_penalty_2.value)
                                                        : commission_penalty_2.value_in === "%"
                                                            ? ((_22 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _22 !== void 0 ? _22 : 0) +
                                                                (((_23 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _23 !== void 0 ? _23 : 0) -
                                                                    ((_24 = game_5 === null || game_5 === void 0 ? void 0 : game_5.price_in_value) !== null && _24 !== void 0 ? _24 : 0) / commission_penalty_2.value)
                                                            : 0),
                                        })];
                                case 10:
                                    _25.sent();
                                    res.json({
                                        winner: (game_5 === null || game_5 === void 0 ? void 0 : game_5.battleScore.player1["round" + round_1]) === gameInPut_3,
                                        price: 0,
                                        final: true,
                                        finalWin: false,
                                    });
                                    return [2];
                                case 11:
                                    res.json({
                                        winner: (game_5 === null || game_5 === void 0 ? void 0 : game_5.battleScore.player1["round" + round_1]) === gameInPut_3,
                                        price: 0,
                                        final: false,
                                    });
                                    _25.label = 12;
                                case 12: return [2];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 8:
                _c.sent();
                return [3, 10];
            case 9:
                error_16 = _c.sent();
                res.status(500).json({ message: "error found", error: error_16 });
                console.error(error_16);
                return [3, 10];
            case 10: return [2];
        }
    });
}); });
GamesRouter.post("/lucky-geoge", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, admin, defaultInstance, cashRating, _a, title, description, memberCount, price, winnerPrice, winnerCount, endDateTime, error_17;
    var _b, _c, _d;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 4, , 5]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                if (!auth || auth === "") {
                    res.status(403).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(401).json({ message: "error found", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, (_c = process.env.SECRET) !== null && _c !== void 0 ? _c : "");
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                admin = _e.sent();
                if (!admin) {
                    res
                        .status(419)
                        .json({ message: "error found", error: "Admin not found" });
                    return [2];
                }
                return [4, default_1.default.findOne({})];
            case 2:
                defaultInstance = _e.sent();
                cashRating = (_d = defaultInstance === null || defaultInstance === void 0 ? void 0 : defaultInstance.cashRating) !== null && _d !== void 0 ? _d : 0;
                _a = req.body, title = _a.title, description = _a.description, memberCount = _a.memberCount, price = _a.price, winnerPrice = _a.winnerPrice, winnerCount = _a.winnerCount, endDateTime = _a.endDateTime;
                return [4, new games_1.default({
                        gameMemberCount: memberCount,
                        members: [],
                        priceType: "virtual",
                        price_in_coin: price * cashRating,
                        price_in_value: price,
                        gameDetail: "Lucky geoge.",
                        gameID: games_1.Games.lucky_geoge,
                        battleScore: {
                            player1: { title: title, description: description, winnerCount: winnerCount, winnerPrice: winnerPrice, endDateTime: endDateTime },
                        },
                    })
                        .save()
                        .then(function (result) {
                        res.json({ message: "successful", game: result });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 3:
                _e.sent();
                return [3, 5];
            case 4:
                error_17 = _e.sent();
                res.status(500).json({ message: "error found", error: error_17 });
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
GamesRouter.get("/lucky-geoge", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, user, admin_2, currentCash, currentCoin, allG_1, error_18;
    var _a, _b, _c, _d, _e, _f;
    return tslib_1.__generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 11, , 12]);
                auth = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
                if (!auth || auth === "") {
                    res.status(403).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(401).json({ message: "error found", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, (_b = process.env.SECRET) !== null && _b !== void 0 ? _b : "");
                return [4, users_1.default.findById(decoded.id)];
            case 1:
                user = _g.sent();
                return [4, admin_1.default.findById(decoded === null || decoded === void 0 ? void 0 : decoded.adminID)];
            case 2:
                admin_2 = _g.sent();
                if (!admin_2) return [3, 4];
                return [4, games_1.default.find({ gameID: games_1.Games.lucky_geoge, played: false })
                        .then(function (games) {
                        res.json({ games: games });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 3:
                _g.sent();
                return [2];
            case 4:
                if (!user) return [3, 9];
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 5:
                currentCash = (_d = (_c = (_g.sent())) === null || _c === void 0 ? void 0 : _c.currentCash) !== null && _d !== void 0 ? _d : 0;
                return [4, walltet_1.default.findOne({ userID: decoded.id })];
            case 6:
                currentCoin = (_f = (_e = (_g.sent())) === null || _e === void 0 ? void 0 : _e.currentCoin) !== null && _f !== void 0 ? _f : 0;
                return [4, games_1.default.find({
                        gameID: games_1.Games.lucky_geoge,
                        played: false,
                    })];
            case 7:
                allG_1 = _g.sent();
                return [4, games_1.default.find({
                        gameID: games_1.Games.lucky_geoge,
                        played: false,
                        $or: [
                            { price_in_value: { $lte: currentCash } },
                            { price_in_coin: { $lte: currentCoin } },
                        ],
                    })
                        .then(function (games) {
                        res.json(admin_2 ? { games: allG_1 } : { games: games });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 8:
                _g.sent();
                return [2];
            case 9:
                res.status(419).json({ message: "error found", error: "User not found" });
                _g.label = 10;
            case 10: return [3, 12];
            case 11:
                error_18 = _g.sent();
                console.log(error_18);
                res.status(500).json({ message: "error found", error: error_18 });
                return [3, 12];
            case 12: return [2];
        }
    });
}); });
GamesRouter.post("/lucky-geoge/play", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, user, currentCash, currentCoin, _a, id_2, payWith, _b, stack, price_in_value, ticket, error_19;
    var _c, _d, _e, _f, _g, _h, _j;
    return tslib_1.__generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 10, , 11]);
                auth = (_c = req.headers.authorization) !== null && _c !== void 0 ? _c : "";
                if (!auth || auth === "") {
                    res.status(403).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(401).json({ message: "error found", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, (_d = process.env.SECRET) !== null && _d !== void 0 ? _d : "");
                return [4, users_1.default.findById(decoded.id)];
            case 1:
                user = _k.sent();
                if (!user) {
                    res.status(419).json({ message: "error found", error: "User not found" });
                    return [2];
                }
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 2:
                currentCash = (_f = (_e = (_k.sent())) === null || _e === void 0 ? void 0 : _e.currentCash) !== null && _f !== void 0 ? _f : 0;
                return [4, walltet_1.default.findOne({ userID: decoded.id })];
            case 3:
                currentCoin = (_h = (_g = (_k.sent())) === null || _g === void 0 ? void 0 : _g.currentCoin) !== null && _h !== void 0 ? _h : 0;
                _a = req.body, id_2 = _a.id, payWith = _a.payWith;
                return [4, games_1.default.findById(id_2)];
            case 4:
                _b = (_j = (_k.sent())) !== null && _j !== void 0 ? _j : { price_in_coin: 0, price_in_value: 0 }, stack = _b.price_in_coin, price_in_value = _b.price_in_value;
                if (!(payWith === enum_1.PayType.cash)) return [3, 6];
                if (price_in_value > currentCash) {
                    res
                        .status(402)
                        .json({ message: "error found", error: "insufficient fund" });
                    return [2];
                }
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, { currentCash: currentCash - stack * 2 })];
            case 5:
                _k.sent();
                return [3, 8];
            case 6:
                if (stack > currentCoin) {
                    res
                        .status(402)
                        .json({ message: "error found", error: "insufficient fund" });
                    return [2];
                }
                return [4, walltet_1.default.updateOne({ userID: decoded.id }, { currentCoin: currentCoin - stack })];
            case 7:
                _k.sent();
                _k.label = 8;
            case 8:
                ticket = randomstring_1.generate({
                    length: 12,
                    charset: "alphabetic",
                });
                return [4, games_1.default.findOneAndUpdate({ _id: id_2 }, {
                        $push: {
                            members: decoded.id,
                            players: {
                                player_name: user.full_name,
                                phone_number: user.phone_number,
                                winner: false,
                                ticket: ticket,
                                date: new Date(),
                                id: user._id,
                            },
                        },
                    })
                        .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var winners, _a, _b, _i, member, _c, _d, _e, winner, currentCash_4;
                        var _f, _g, _h, _j;
                        return tslib_1.__generator(this, function (_k) {
                            switch (_k.label) {
                                case 0:
                                    res.json({ message: "successful", price: result === null || result === void 0 ? void 0 : result.price_in_value });
                                    if (!(((_f = result === null || result === void 0 ? void 0 : result.members.length) !== null && _f !== void 0 ? _f : 0) >= ((_g = result === null || result === void 0 ? void 0 : result.gameMemberCount) !== null && _g !== void 0 ? _g : 0))) return [3, 12];
                                    winners = function_1.shuffle((_h = result === null || result === void 0 ? void 0 : result.members) !== null && _h !== void 0 ? _h : [""]).slice(0, result === null || result === void 0 ? void 0 : result.battleScore.player1.winnerCount);
                                    _a = [];
                                    for (_b in result === null || result === void 0 ? void 0 : result.members)
                                        _a.push(_b);
                                    _i = 0;
                                    _k.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3, 4];
                                    member = _a[_i];
                                    if (!!winners.includes(member)) return [3, 3];
                                    return [4, gamerecord_1.default.updateOne({
                                            userID: member,
                                        }, {
                                            won: "no",
                                            earnings: 0,
                                            date_mark: new Date(),
                                        })];
                                case 2:
                                    _k.sent();
                                    _k.label = 3;
                                case 3:
                                    _i++;
                                    return [3, 1];
                                case 4:
                                    _c = [];
                                    for (_d in winners)
                                        _c.push(_d);
                                    _e = 0;
                                    _k.label = 5;
                                case 5:
                                    if (!(_e < _c.length)) return [3, 10];
                                    winner = _c[_e];
                                    return [4, cash_wallet_1.default.findById(winner)];
                                case 6:
                                    currentCash_4 = ((_j = (_k.sent())) !== null && _j !== void 0 ? _j : {
                                        currentCash: 0,
                                    }).currentCash;
                                    return [4, gamerecord_1.default.updateOne({
                                            userID: winner,
                                        }, {
                                            won: "yes",
                                            earnings: result === null || result === void 0 ? void 0 : result.battleScore.player1.winnerPrice,
                                            date_mark: new Date(),
                                        })];
                                case 7:
                                    _k.sent();
                                    return [4, cash_wallet_1.default.updateOne({ _id: winner }, {
                                            currentCash: (currentCash_4 !== null && currentCash_4 !== void 0 ? currentCash_4 : 0) + (result === null || result === void 0 ? void 0 : result.battleScore.player1.winnerPrice),
                                        })];
                                case 8:
                                    _k.sent();
                                    _k.label = 9;
                                case 9:
                                    _e++;
                                    return [3, 5];
                                case 10: return [4, games_1.default.updateOne({ _id: id_2 }, { played: true })
                                        .then(function () { })
                                        .catch(console.error)];
                                case 11:
                                    _k.sent();
                                    _k.label = 12;
                                case 12: return [2];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 9:
                _k.sent();
                return [3, 11];
            case 10:
                error_19 = _k.sent();
                res.status(500).json({ message: "error found", error: error_19 });
                return [3, 11];
            case 11: return [2];
        }
    });
}); });
GamesRouter.post("/lucky-judge/update", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, user, _a, id, newGameTime, battleScore, error_20;
    var _b, _c, _d;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 4, , 5]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                if (!auth || auth === "") {
                    res.status(403).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(401).json({ message: "error found", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, (_c = process.env.SECRET) !== null && _c !== void 0 ? _c : "");
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                user = _e.sent();
                if (!user) {
                    res.status(419).json({ message: "error found", error: "User not found" });
                    return [2];
                }
                _a = req.body, id = _a.id, newGameTime = _a.newGameTime;
                return [4, games_1.default.findOne({ _id: id })];
            case 2:
                battleScore = ((_d = (_e.sent())) !== null && _d !== void 0 ? _d : {
                    battleScore: { player1: {}, player2: {} },
                }).battleScore;
                return [4, games_1.default.findOneAndUpdate({ _id: id }, {
                        battleScore: {
                            player1: tslib_1.__assign(tslib_1.__assign({}, battleScore.player1), { endDateTime: newGameTime }),
                            player2: {},
                        },
                    })
                        .then(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            res.json({ message: "successful" });
                            return [2];
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 3:
                _e.sent();
                return [3, 5];
            case 4:
                error_20 = _e.sent();
                res.status(500).json({ message: "error found", error: error_20 });
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
GamesRouter.delete("/lucky-judge", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, admin, id, error_21;
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
                return [4, games_1.default.deleteOne({ _id: id })
                        .then(function () {
                        res.json({ message: "deleted successfully" });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error", error: error });
                    })];
            case 2:
                _a.sent();
                return [3, 4];
            case 3:
                error_21 = _a.sent();
                res.status(500).json({ error: error_21 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
GamesRouter.post("/penalty/exit", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, id, token, decoded, found, _a, cashRating, commission_penalty, game_, p1Cash, error_22;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    return tslib_1.__generator(this, function (_u) {
        switch (_u.label) {
            case 0:
                _u.trys.push([0, 8, , 9]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                id = req.body.id;
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
                found = _u.sent();
                return [4, default_1.default.findOne({})];
            case 2:
                _a = (_c = (_u.sent())) !== null && _c !== void 0 ? _c : { cashRating: 0, commission_penalty: { value: 0, value_in: "$" } }, cashRating = _a.cashRating, commission_penalty = _a.commission_penalty;
                return [4, games_1.default.findById(id)];
            case 3:
                game_ = _u.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                    })];
            case 4:
                p1Cash = ((_d = (_u.sent())) !== null && _d !== void 0 ? _d : { currentCash: 0 }).currentCash;
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.penalth_card,
                        won: "no",
                        earnings: 0,
                    }).save()];
            case 5:
                _u.sent();
                return [4, new gamerecord_1.default({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                        game: games_1.Games.penalth_card,
                        won: "yes",
                        earnings: commission_penalty.value_in === "$"
                            ? ((_e = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _e !== void 0 ? _e : 0) +
                                (((_f = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _f !== void 0 ? _f : 0) - commission_penalty.value)
                            : commission_penalty.value_in === "c"
                                ? ((_g = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _g !== void 0 ? _g : 0) +
                                    (((_h = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _h !== void 0 ? _h : 0) -
                                        cashRating * commission_penalty.value)
                                : commission_penalty.value_in === "%"
                                    ? ((_j = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _j !== void 0 ? _j : 0) +
                                        (((_k = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _k !== void 0 ? _k : 0) -
                                            ((_l = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _l !== void 0 ? _l : 0) / commission_penalty.value)
                                    : p1Cash,
                    }).save()];
            case 6:
                _u.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0] }, {
                        p1Cash: commission_penalty.value_in === "$"
                            ? p1Cash +
                                ((_m = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _m !== void 0 ? _m : 0) +
                                (((_o = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _o !== void 0 ? _o : 0) - commission_penalty.value)
                            : commission_penalty.value_in === "c"
                                ? ((_p = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _p !== void 0 ? _p : 0) +
                                    p1Cash +
                                    (((_q = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _q !== void 0 ? _q : 0) -
                                        cashRating * commission_penalty.value)
                                : commission_penalty.value_in === "%"
                                    ? ((_r = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _r !== void 0 ? _r : 0) +
                                        p1Cash +
                                        (((_s = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _s !== void 0 ? _s : 0) -
                                            ((_t = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _t !== void 0 ? _t : 0) / commission_penalty.value)
                                    : p1Cash,
                    })
                        .then(function () {
                        res.json({
                            message: "game exit",
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 7:
                _u.sent();
                return [3, 9];
            case 8:
                error_22 = _u.sent();
                res.status(500).json({ message: "error found", error: error_22 });
                console.error(error_22);
                return [3, 9];
            case 9: return [2];
        }
    });
}); });
GamesRouter.post("/roshambo/exit", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, id, token, decoded, found, _a, cashRating, commission_roshambo, game_, p1Cash, error_23;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    return tslib_1.__generator(this, function (_u) {
        switch (_u.label) {
            case 0:
                _u.trys.push([0, 8, , 9]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                id = req.body.id;
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
                found = _u.sent();
                return [4, default_1.default.findOne({})];
            case 2:
                _a = (_c = (_u.sent())) !== null && _c !== void 0 ? _c : { cashRating: 0, commission_roshambo: { value: 0, value_in: "$" } }, cashRating = _a.cashRating, commission_roshambo = _a.commission_roshambo;
                return [4, games_1.default.findById(id)];
            case 3:
                game_ = _u.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                    })];
            case 4:
                p1Cash = ((_d = (_u.sent())) !== null && _d !== void 0 ? _d : { currentCash: 0 }).currentCash;
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, new gamerecord_1.default({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                        game: games_1.Games.roshambo,
                        won: "yes",
                        earnings: commission_roshambo.value_in === "$"
                            ? ((_e = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _e !== void 0 ? _e : 0) +
                                (((_f = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _f !== void 0 ? _f : 0) - commission_roshambo.value)
                            : commission_roshambo.value_in === "c"
                                ? ((_g = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _g !== void 0 ? _g : 0) +
                                    (((_h = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _h !== void 0 ? _h : 0) -
                                        cashRating * commission_roshambo.value)
                                : commission_roshambo.value_in === "%"
                                    ? ((_j = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _j !== void 0 ? _j : 0) +
                                        (((_k = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _k !== void 0 ? _k : 0) -
                                            ((_l = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _l !== void 0 ? _l : 0) / commission_roshambo.value)
                                    : p1Cash,
                    }).save()];
            case 5:
                _u.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.roshambo,
                        won: "no",
                        earnings: 0,
                    }).save()];
            case 6:
                _u.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0] }, {
                        p1Cash: commission_roshambo.value_in === "$"
                            ? p1Cash +
                                ((_m = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _m !== void 0 ? _m : 0) +
                                (((_o = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _o !== void 0 ? _o : 0) - commission_roshambo.value)
                            : commission_roshambo.value_in === "c"
                                ? ((_p = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _p !== void 0 ? _p : 0) +
                                    p1Cash +
                                    (((_q = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _q !== void 0 ? _q : 0) -
                                        cashRating * commission_roshambo.value)
                                : commission_roshambo.value_in === "%"
                                    ? ((_r = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _r !== void 0 ? _r : 0) +
                                        p1Cash +
                                        (((_s = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _s !== void 0 ? _s : 0) -
                                            ((_t = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _t !== void 0 ? _t : 0) / commission_roshambo.value)
                                    : p1Cash,
                    })
                        .then(function () {
                        res.json({
                            message: "game exit",
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 7:
                _u.sent();
                return [3, 9];
            case 8:
                error_23 = _u.sent();
                res.status(500).json({ message: "error found", error: error_23 });
                console.error(error_23);
                return [3, 9];
            case 9: return [2];
        }
    });
}); });
GamesRouter.post("/matcher/exit", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, id, token, decoded, found, _a, cashRating, commission_guess_mater, game_, p1Cash, error_24;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    return tslib_1.__generator(this, function (_1) {
        switch (_1.label) {
            case 0:
                _1.trys.push([0, 8, , 9]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                id = req.body.id;
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
                found = _1.sent();
                return [4, default_1.default.findOne({})];
            case 2:
                _a = (_c = (_1.sent())) !== null && _c !== void 0 ? _c : {
                    cashRating: 0,
                    commission_guess_mater: { value: 0, value_in: "$" },
                }, cashRating = _a.cashRating, commission_guess_mater = _a.commission_guess_mater;
                return [4, games_1.default.findById(id)];
            case 3:
                game_ = _1.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                    })];
            case 4:
                p1Cash = ((_d = (_1.sent())) !== null && _d !== void 0 ? _d : { currentCash: 0 }).currentCash;
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, new gamerecord_1.default({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                        game: games_1.Games.roshambo,
                        won: "yes",
                        earnings: commission_guess_mater.value_in === "$"
                            ? ((_e = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _e !== void 0 ? _e : 0) +
                                (((_f = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _f !== void 0 ? _f : 0) - commission_guess_mater.value)
                            : commission_guess_mater.value_in === "c"
                                ? ((_g = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _g !== void 0 ? _g : 0) +
                                    (((_h = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _h !== void 0 ? _h : 0) -
                                        cashRating * commission_guess_mater.value)
                                : commission_guess_mater.value_in === "%"
                                    ? ((_j = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _j !== void 0 ? _j : 0) +
                                        (((_k = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _k !== void 0 ? _k : 0) -
                                            ((_l = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _l !== void 0 ? _l : 0) / commission_guess_mater.value)
                                    : p1Cash,
                    }).save()];
            case 5:
                _1.sent();
                return [4, new gamerecord_1.default({
                        userID: decoded.id,
                        game: games_1.Games.roshambo,
                        won: "no",
                        earnings: commission_guess_mater.value_in === "$"
                            ? ((_m = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _m !== void 0 ? _m : 0) +
                                (((_o = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _o !== void 0 ? _o : 0) - commission_guess_mater.value)
                            : commission_guess_mater.value_in === "c"
                                ? ((_p = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _p !== void 0 ? _p : 0) +
                                    (((_q = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _q !== void 0 ? _q : 0) -
                                        cashRating * commission_guess_mater.value)
                                : commission_guess_mater.value_in === "%"
                                    ? ((_r = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _r !== void 0 ? _r : 0) +
                                        (((_s = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _s !== void 0 ? _s : 0) -
                                            ((_t = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _t !== void 0 ? _t : 0) / commission_guess_mater.value)
                                    : p1Cash,
                    }).save()];
            case 6:
                _1.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0] }, {
                        p1Cash: commission_guess_mater.value_in === "$"
                            ? p1Cash +
                                ((_u = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _u !== void 0 ? _u : 0) +
                                (((_v = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _v !== void 0 ? _v : 0) - commission_guess_mater.value)
                            : commission_guess_mater.value_in === "c"
                                ? ((_w = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _w !== void 0 ? _w : 0) +
                                    p1Cash +
                                    (((_x = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _x !== void 0 ? _x : 0) -
                                        cashRating * commission_guess_mater.value)
                                : commission_guess_mater.value_in === "%"
                                    ? ((_y = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _y !== void 0 ? _y : 0) +
                                        p1Cash +
                                        (((_z = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _z !== void 0 ? _z : 0) -
                                            ((_0 = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _0 !== void 0 ? _0 : 0) / commission_guess_mater.value)
                                    : p1Cash,
                    })
                        .then(function () {
                        res.json({
                            message: "game exit",
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 7:
                _1.sent();
                return [3, 9];
            case 8:
                error_24 = _1.sent();
                res.status(500).json({ message: "error found", error: error_24 });
                console.error(error_24);
                return [3, 9];
            case 9: return [2];
        }
    });
}); });
GamesRouter.post("/custom-game", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded_7, found, cashRating, currentCash_5, _a, player2Username, price_in_value, title, description, answer, endDate, endGameTime, choice, p2, error_25;
    var _b, _c, _d;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 6, , 7]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                if (!auth) {
                    res.status(406).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(406).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded_7 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_7.id)];
            case 1:
                found = _e.sent();
                if (!found) {
                    res.status(406).json({
                        message: "error found",
                        error: "user no found",
                    });
                    return [2];
                }
                return [4, default_1.default.findOne({})];
            case 2:
                cashRating = ((_c = (_e.sent())) !== null && _c !== void 0 ? _c : {
                    cashRating: 0,
                }).cashRating;
                return [4, cash_wallet_1.default.findOne({
                        userID: decoded_7.id,
                    })];
            case 3:
                currentCash_5 = ((_d = (_e.sent())) !== null && _d !== void 0 ? _d : { currentCash: 0 }).currentCash;
                _a = req.body, player2Username = _a.player2Username, price_in_value = _a.price_in_value, title = _a.title, description = _a.description, answer = _a.answer, endDate = _a.endDate, endGameTime = _a.endGameTime, choice = _a.choice;
                if (currentCash_5 < price_in_value) {
                    res
                        .status(402)
                        .json({ message: "error found", error: "insuficient found" });
                    return [2];
                }
                return [4, player_1.default.findOne({ playername: player2Username })];
            case 4:
                p2 = _e.sent();
                if ((!p2 || p2.userID === decoded_7.id) && player2Username !== "") {
                    res
                        .status(409)
                        .json({ message: "error found", error: "player 2 not found" });
                    return [2];
                }
                return [4, new games_1.default({
                        gameMemberCount: 2,
                        members: p2 ? [decoded_7.id, p2.userID] : [decoded_7.id],
                        price_in_coin: cashRating * price_in_value,
                        price_in_value: price_in_value,
                        gameDetail: "A game created between friends",
                        gameID: games_1.Games.custom_game,
                        played: false,
                        battleScore: {
                            player1: {
                                endDate: endDate,
                                title: title,
                                description: description,
                                answer: answer,
                                endGameTime: endGameTime,
                                choice: choice,
                            },
                        },
                        playCount: 0,
                    })
                        .save()
                        .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, cash_wallet_1.default.updateOne({ userID: decoded_7.id }, { currentCash: currentCash_5 - result.price_in_value })];
                                case 1:
                                    _a.sent();
                                    res.json({ message: "successful", game: result });
                                    return [2];
                            }
                        });
                    }); })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 5:
                _e.sent();
                return [3, 7];
            case 6:
                error_25 = _e.sent();
                res.status(500).json({ message: "error found", error: error_25 });
                console.error(error_25);
                return [3, 7];
            case 7: return [2];
        }
    });
}); });
GamesRouter.get("/custom-game/challange", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, _a, gameID, payWith, answer, paywith, currentCash, currentCoin, _b, price_in_value, price_in_coin, battleScore, members, error_26;
    var _c, _d, _e, _f;
    return tslib_1.__generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 11, , 12]);
                auth = (_c = req.headers.authorization) !== null && _c !== void 0 ? _c : "";
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
                found = _g.sent();
                if (!found) {
                    res.status(406).json({
                        message: "error found",
                        error: "user no found",
                    });
                    return [2];
                }
                _a = req.query, gameID = _a.gameID, payWith = _a.payWith, answer = _a.answer;
                paywith = parseInt(payWith, 10);
                return [4, cash_wallet_1.default.findOne({
                        userID: decoded.id,
                    })];
            case 2:
                currentCash = ((_d = (_g.sent())) !== null && _d !== void 0 ? _d : { currentCash: 0 }).currentCash;
                return [4, walltet_1.default.findOne({
                        userID: decoded.id,
                    })];
            case 3:
                currentCoin = ((_e = (_g.sent())) !== null && _e !== void 0 ? _e : { currentCoin: 0 }).currentCoin;
                return [4, games_1.default.findById(gameID)];
            case 4:
                _b = (_f = (_g.sent())) !== null && _f !== void 0 ? _f : {
                    price_in_coin: 0,
                    price_in_value: 0,
                    battleScore: { player1: {}, player2: {} },
                    members: [],
                }, price_in_value = _b.price_in_value, price_in_coin = _b.price_in_coin, battleScore = _b.battleScore, members = _b.members;
                if (!(paywith === enum_1.PayType.cash)) return [3, 7];
                if (price_in_value > currentCash) {
                    res.status(402).json({
                        message: "error found",
                        error: "insufficient fund",
                    });
                    return [2];
                }
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, { currentCash: currentCash - price_in_value })];
            case 5:
                _g.sent();
                return [4, games_1.default.updateOne({ _id: gameID }, {
                        played: true,
                        date: new Date(),
                        members: tslib_1.__spread(members, [decoded.id]),
                        battleScore: { player1: battleScore.player1, player2: { answer: answer } },
                    })
                        .then(function () {
                        res.json({ message: "successful" });
                    })
                        .catch(function (error) {
                        res
                            .status(400)
                            .json({ message: "error found", error: error });
                    })];
            case 6:
                _g.sent();
                _g.label = 7;
            case 7:
                if (!(paywith === enum_1.PayType.coin)) return [3, 10];
                if (price_in_coin > currentCoin) {
                    res.status(402).json({
                        message: "error found",
                        error: "insufficient fund",
                    });
                    return [2];
                }
                return [4, walltet_1.default.updateOne({ userID: decoded.id }, { currentCoin: currentCoin - price_in_coin })];
            case 8:
                _g.sent();
                return [4, games_1.default.updateOne({ _id: gameID }, {
                        played: true,
                        date: new Date(),
                        battleScore: { player1: battleScore.player1, player2: { answer: answer } },
                    })
                        .then(function () {
                        res.json({ message: "successful" });
                    })
                        .catch(function (error) {
                        res
                            .status(400)
                            .json({ message: "error found", error: error });
                    })];
            case 9:
                _g.sent();
                _g.label = 10;
            case 10: return [3, 12];
            case 11:
                error_26 = _g.sent();
                res.status(500).json({ message: "error found", error: error_26 });
                console.error(error_26);
                return [3, 12];
            case 12: return [2];
        }
    });
}); });
GamesRouter.post("/custom-game/exit", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, id, token, decoded, found, _a, cashRating, commission_custom_game, game_, p1Cash, error_27;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return tslib_1.__generator(this, function (_m) {
        switch (_m.label) {
            case 0:
                _m.trys.push([0, 8, , 9]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                id = req.body.id;
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
                found = _m.sent();
                return [4, default_1.default.findOne({})];
            case 2:
                _a = (_c = (_m.sent())) !== null && _c !== void 0 ? _c : {
                    cashRating: 0,
                    commission_custom_game: { value: 0, value_in: "$" },
                }, cashRating = _a.cashRating, commission_custom_game = _a.commission_custom_game;
                return [4, games_1.default.findById(id)];
            case 3:
                game_ = _m.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                    })];
            case 4:
                p1Cash = ((_d = (_m.sent())) !== null && _d !== void 0 ? _d : { currentCash: 0 }).currentCash;
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, games_1.default.updateOne({ _id: id }, { played: true })];
            case 5:
                _m.sent();
                return [4, new gamerecord_1.default({
                        userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0],
                        game: games_1.Games.custom_game,
                        won: "rejected",
                        earnings: game_ === null || game_ === void 0 ? void 0 : game_.price_in_value,
                    }).save()];
            case 6:
                _m.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: game_ === null || game_ === void 0 ? void 0 : game_.members[0] }, {
                        p1Cash: commission_custom_game.value_in === "$"
                            ? p1Cash +
                                ((_e = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _e !== void 0 ? _e : 0) +
                                (((_f = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _f !== void 0 ? _f : 0) - commission_custom_game.value)
                            : commission_custom_game.value_in === "c"
                                ? ((_g = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _g !== void 0 ? _g : 0) +
                                    p1Cash +
                                    (((_h = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _h !== void 0 ? _h : 0) -
                                        cashRating * commission_custom_game.value)
                                : commission_custom_game.value_in === "%"
                                    ? ((_j = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _j !== void 0 ? _j : 0) +
                                        p1Cash +
                                        (((_k = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _k !== void 0 ? _k : 0) -
                                            ((_l = game_ === null || game_ === void 0 ? void 0 : game_.price_in_value) !== null && _l !== void 0 ? _l : 0) / commission_custom_game.value)
                                    : p1Cash,
                    })
                        .then(function () {
                        res.json({
                            message: "game exit",
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 7:
                _m.sent();
                return [3, 9];
            case 8:
                error_27 = _m.sent();
                res.status(500).json({ message: "error found", error: error_27 });
                console.error(error_27);
                return [3, 9];
            case 9: return [2];
        }
    });
}); });
GamesRouter.get("/requests", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded_8, found, error_28;
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
                decoded_8 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_8.id)];
            case 1:
                found = _b.sent();
                if (!found) {
                    res.status(419).json({
                        message: "error found",
                        error: "user no found",
                    });
                    return [2];
                }
                return [4, games_1.default.find({
                        isComplete: false,
                        gameID: games_1.Games.custom_game,
                        members: decoded_8.id,
                        played: false,
                    })
                        .sort({ date: -1 })
                        .then(function (result) {
                        res.json({
                            message: "content found",
                            requests: lodash_1.filter(result, function (__game) {
                                return __game.members[0] !== decoded_8.id;
                            }),
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_28 = _b.sent();
                res.status(500).json({ message: "error found", error: error_28 });
                console.error(error_28);
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
GamesRouter.get("/custom-game/games", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, error_29;
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
                    res.status(419).json({
                        message: "error found",
                        error: "user no found",
                    });
                    return [2];
                }
                return [4, games_1.default.find({
                        played: true,
                        gameID: games_1.Games.custom_game,
                        isComplete: false,
                    })
                        .sort({ date: -1 })
                        .then(function (requests) {
                        res.json({ message: "content found", requests: requests });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_29 = _b.sent();
                res.status(500).json({ message: "error found", error: error_29 });
                console.error(error_29);
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
GamesRouter.post("/custom-game/judge", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, _a, choice, game_id, game_played, defaultInstance, cashInstance, p2CashInstance, error_30;
    var _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 11, , 12]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
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
                found = _c.sent();
                if (!found) {
                    res.status(406).json({
                        message: "error found",
                        error: "user no found",
                    });
                    return [2];
                }
                _a = req.body, choice = _a.choice, game_id = _a.game_id;
                return [4, games_1.default.findOne({ _id: game_id })];
            case 2:
                game_played = _c.sent();
                return [4, default_1.default.findOne({})];
            case 3:
                defaultInstance = _c.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 4:
                cashInstance = _c.sent();
                return [4, cash_wallet_1.default.findOne({
                        userID: game_played === null || game_played === void 0 ? void 0 : game_played.members[0],
                    })];
            case 5:
                p2CashInstance = _c.sent();
                if (!defaultInstance || !cashInstance || !p2CashInstance) {
                    res.status(406).json({
                        message: "error found",
                        error: "Bad instance",
                    });
                    return [2];
                }
                if (!((game_played === null || game_played === void 0 ? void 0 : game_played.members[0]) === decoded.id)) return [3, 7];
                return [4, games_1.default.updateOne({ _id: game_id }, {
                        battleScore: {
                            player1: tslib_1.__assign(tslib_1.__assign({}, game_played.battleScore.player1), { correct_answer: choice }),
                            player2: tslib_1.__assign({}, game_played.battleScore.player2),
                        },
                    })
                        .then(function () {
                        res.json({ message: "done" });
                    })
                        .catch(function () {
                        res.status(500).json({ error: "not your game" });
                    })];
            case 6:
                _c.sent();
                return [3, 10];
            case 7:
                if (!((game_played === null || game_played === void 0 ? void 0 : game_played.members[1]) === decoded.id)) return [3, 9];
                return [4, games_1.default.updateOne({ _id: game_id }, {
                        battleScore: {
                            player1: tslib_1.__assign({}, game_played.battleScore.player1),
                            player2: tslib_1.__assign(tslib_1.__assign({}, game_played.battleScore.player2), { correct_answer: choice }),
                        },
                    })
                        .then(function () {
                        res.json({ message: "done" });
                    })
                        .catch(function () {
                        res.status(500).json({ error: "not your game" });
                    })];
            case 8:
                _c.sent();
                return [3, 10];
            case 9:
                res.status(500).json({ error: "not your game" });
                _c.label = 10;
            case 10: return [3, 12];
            case 11:
                error_30 = _c.sent();
                res.status(500).json({ error: error_30, message: "error found" });
                console.error(error_30);
                return [3, 12];
            case 12: return [2];
        }
    });
}); });
GamesRouter.get("/custom-game/disputes", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, judgableGames, _a, error_31;
    var _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
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
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                found = _c.sent();
                if (!found) {
                    res.status(406).json({
                        message: "error found",
                        error: "user no found",
                    });
                    return [2];
                }
                _a = lodash_1.filter;
                return [4, games_1.default.find({
                        played: true,
                        isComplete: false,
                        gameID: games_1.Games.custom_game,
                    })];
            case 2:
                judgableGames = _a.apply(void 0, [_c.sent(),
                    function (game) {
                        return (lodash_1.isEmpty(game.battleScore.player1.correct_answer) ||
                            !lodash_1.isEmpty(game.battleScore.player2.correct_answer));
                    }]);
                res.json({ games: judgableGames });
                return [3, 4];
            case 3:
                error_31 = _c.sent();
                res.status(500).json({ error: error_31, message: "breakdown" });
                console.log(error_31);
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
GamesRouter.get("/custom-game/disputes/oversea", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, id, judgableGame, player1, player2, error_32;
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
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                found = _b.sent();
                if (!found) {
                    res.status(406).json({
                        message: "error found",
                        error: "user no found",
                    });
                    return [2];
                }
                id = req.query.id;
                return [4, games_1.default.findOne({ _id: id })];
            case 2:
                judgableGame = _b.sent();
                if (!judgableGame) {
                    res.status(404).json({ message: "error", error: "not found" });
                    return [2];
                }
                player1 = users_1.default.findOne({ _id: judgableGame.members[0] });
                player2 = users_1.default.findOne({ _id: judgableGame.members[1] });
                res.json({ gameDetail: tslib_1.__assign(tslib_1.__assign({}, judgableGame), { player1: player1, player2: player2 }) });
                return [3, 4];
            case 3:
                error_32 = _b.sent();
                res.status(500).json({ error: error_32, message: "breakdown" });
                console.log(error_32);
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
exports.default = GamesRouter;
