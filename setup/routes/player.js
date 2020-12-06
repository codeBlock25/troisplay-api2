"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var player_1 = __importDefault(require("../model/player"));
var multer_1 = __importStar(require("multer"));
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
var users_1 = __importDefault(require("../model/users"));
var device_1 = __importDefault(require("../model/device"));
var gamerecord_1 = __importDefault(require("../model/gamerecord"));
var referals_1 = __importDefault(require("../model/referals"));
var walltet_1 = __importDefault(require("../model/walltet"));
var bcryptjs_1 = require("bcryptjs");
var cash_wallet_1 = __importDefault(require("../model/cash_wallet"));
var salt = bcryptjs_1.genSaltSync(10);
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
var storage = multer_1.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, "static/media");
    },
    filename: function (_req, file, cb) {
        var _a;
        cb(null, file.fieldname +
            "-" +
            Date.now() +
            ("." + ((_a = file.mimetype.split("/")[1]) !== null && _a !== void 0 ? _a : "png")));
    },
});
var upload = multer_1.default({ storage: storage });
var PlayerRouter = express_1.Router();
PlayerRouter.post("/new", upload.single("profile-pic"), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded_1, found, deviceSetup_1, gamerecord_2, referal_1, wallet_1, _a, playername, email, location_1, bank_name, account_number, recovery_question, recovery_answer, newplayer, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 7, , 8]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                if (!auth) {
                    res.status(410).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(410).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded_1 = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded_1.id)];
            case 1:
                found = _c.sent();
                return [4, device_1.default.findOne({ userID: decoded_1.id })];
            case 2:
                deviceSetup_1 = _c.sent();
                return [4, gamerecord_1.default.find({ userID: decoded_1.id })
                        .sort({ date_mark: -1 })
                        .limit(10)];
            case 3:
                gamerecord_2 = _c.sent();
                return [4, referals_1.default.findOne({ userID: decoded_1.id })];
            case 4:
                referal_1 = _c.sent();
                return [4, walltet_1.default.findOne({ userID: decoded_1.id })];
            case 5:
                wallet_1 = _c.sent();
                _a = req.body, playername = _a.playername, email = _a.email, location_1 = _a.location, bank_name = _a.bank_name, account_number = _a.account_number, recovery_question = _a.recovery_question, recovery_answer = _a.recovery_answer;
                if (!found) {
                    res.status(410).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                newplayer = void 0;
                if (req.file) {
                    newplayer = new player_1.default({
                        userID: decoded_1.id,
                        playername: playername,
                        playerpic: "media/" + req.file.filename,
                        email: email,
                        location: location_1,
                        bank_name: bank_name,
                        account_number: account_number,
                        recovery_question: recovery_question,
                        recovery_answer: recovery_answer,
                    });
                }
                else {
                    newplayer = new player_1.default({
                        userID: decoded_1.id,
                        playername: playername,
                        email: email,
                        location: location_1,
                        bank_name: bank_name,
                        account_number: account_number,
                        recovery_question: recovery_question,
                        recovery_answer: recovery_answer,
                    });
                }
                return [4, newplayer
                        .save()
                        .then(function (result) {
                        res.json({
                            message: "successful",
                            player: {
                                userID: decoded_1.id,
                                playerpic: result.playerpic,
                                playername: result.playername,
                                email: result.email,
                                about_me: result.about_me,
                                location: result.location,
                                bank_name: result.bank_name,
                                account_number: result.account_number,
                            },
                            deviceSetup: deviceSetup_1,
                            referal: referal_1,
                            wallet: wallet_1,
                            gamerecord: gamerecord_2,
                        });
                    })
                        .catch(function (err) {
                        if (err.keyPattern.playername) {
                            res.status(400).json({ message: "error found", error: err });
                            return;
                        }
                        if (err.keyPattern.userID) {
                            res.status(402).json({ message: "error found", error: err });
                            return;
                        }
                        res.status(503).json({ message: "error found", error: err });
                    })];
            case 6:
                _c.sent();
                return [3, 8];
            case 7:
                error_1 = _c.sent();
                console.error(error_1);
                return [3, 8];
            case 8: return [2];
        }
    });
}); });
PlayerRouter.get("/records", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, user_, found, deviceSetup, gamerecord, referal, wallet, cashwallet, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                auth = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
                if (!auth) {
                    res.status(410).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(410).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                return [4, users_1.default.findById(decoded.id)];
            case 1:
                user_ = _b.sent();
                return [4, player_1.default.findOne({
                        userID: decoded.id,
                    })];
            case 2:
                found = _b.sent();
                return [4, device_1.default.findOne({ userID: decoded.id })];
            case 3:
                deviceSetup = _b.sent();
                return [4, gamerecord_1.default.find({ userID: decoded.id })
                        .sort({ date_mark: -1 })
                        .limit(30)];
            case 4:
                gamerecord = _b.sent();
                return [4, referals_1.default.findOne({ userID: decoded.id })];
            case 5:
                referal = _b.sent();
                return [4, walltet_1.default.findOne({ userID: decoded.id })];
            case 6:
                wallet = _b.sent();
                return [4, cash_wallet_1.default.findOne({ userID: decoded.id })];
            case 7:
                cashwallet = _b.sent();
                if (!found) {
                    res
                        .status(410)
                        .json({ message: "errornn found", error: "invalid_ user" });
                    return [2];
                }
                res.json({
                    message: "content found",
                    user: {
                        full_name: user_ === null || user_ === void 0 ? void 0 : user_.full_name,
                        phone_number: user_ === null || user_ === void 0 ? void 0 : user_.phone_number,
                    },
                    player: {
                        userID: decoded.id,
                        full_name: user_ === null || user_ === void 0 ? void 0 : user_.full_name,
                        phone_number: user_ === null || user_ === void 0 ? void 0 : user_.phone_number,
                        playerpic: found.playerpic,
                        playername: found.playername,
                        email: found.email,
                        location: found.location,
                    },
                    deviceSetup: deviceSetup,
                    referal: referal,
                    wallet: wallet,
                    gamerecord: gamerecord,
                    cashwallet: cashwallet,
                });
                return [3, 9];
            case 8:
                error_2 = _b.sent();
                res.status(500).json({ error: error_2 });
                return [3, 9];
            case 9: return [2];
        }
    });
}); });
PlayerRouter.post("/forgot", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var phone_number, user, player;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                phone_number = req.body.phone_number;
                return [4, users_1.default.findOne({
                        phone_number: phone_number.replace("+", "").replace(" ", ""),
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(403).json({ message: "error found", error: "user not found" });
                    return [2];
                }
                return [4, player_1.default.findOne({ userID: user._id })];
            case 2:
                player = _a.sent();
                if (!player) {
                    res.status(401).json({ message: "error found", error: "player not found" });
                    return [2];
                }
                res.json({
                    message: "content found",
                    content: {
                        recovery_question: player.recovery_question,
                    },
                });
                return [2];
        }
    });
}); });
PlayerRouter.post("/forgot/confirm", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, phone_number, answer, user, player, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, phone_number = _a.phone_number, answer = _a.answer;
                return [4, users_1.default.findOne({
                        phone_number: phone_number.replace("+", "").replace(" ", ""),
                    })];
            case 1:
                user = _b.sent();
                if (!user) {
                    res.status(404).json({ message: "error found", error: "user not found" });
                    return [2];
                }
                return [4, player_1.default.findOne({ userID: user._id })];
            case 2:
                player = _b.sent();
                if (!player) {
                    res.status(401).json({ message: "error found", error: "player not found" });
                    return [2];
                }
                if (player.recovery_answer === answer) {
                    token = jsonwebtoken_1.sign({ playerID: player.userID }, secret, {
                        expiresIn: "3 hours",
                    });
                    res.json({
                        message: "content found",
                        token: token,
                    });
                    return [2];
                }
                res.status(401).json({ message: "error found", error: "incorrect answer" });
                return [2];
        }
    });
}); });
PlayerRouter.post("/forgot/update", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, betting_key, hashedKey, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                auth = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
                if (!auth) {
                    res.status(410).json({ message: "error found", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token || token === "") {
                    res.status(410).json({ message: "error found", error: "empty token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, secret);
                betting_key = req.body.betting_key;
                hashedKey = bcryptjs_1.hashSync(betting_key, salt);
                return [4, users_1.default
                        .updateOne({ _id: decoded.playerID }, {
                        key: hashedKey,
                    })
                        .then(function () {
                        res.json({ message: "successful" });
                    })
                        .catch(function (error) {
                        res.json({ message: "error found", error: error });
                    })];
            case 1:
                _b.sent();
                return [3, 3];
            case 2:
                error_3 = _b.sent();
                res.status(500).json({ message: "error found", error: error_3 });
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
exports.default = PlayerRouter;
