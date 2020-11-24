"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.payload = void 0;
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var users_1 = __importDefault(require("../model/users"));
var dotenv_1 = require("dotenv");
var cash_wallet_1 = __importDefault(require("../model/cash_wallet"));
var bcryptjs_1 = require("bcryptjs");
var flutterwave_node_v3_1 = __importDefault(require("flutterwave-node-v3"));
var wallet_1 = require("./wallet");
var player_1 = __importDefault(require("../model/player"));
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
exports.payload = {
    country: "NG",
    customer: "",
    amount: 0,
    recurrence: "ONCE",
    type: "AIRTIME",
    reference: Math.ceil(Math.random() * 19920392039)
};
var BillRouter = express_1.Router();
var flw = new flutterwave_node_v3_1.default(wallet_1.PUBLIC_KEY, wallet_1.SECRET_KEY, wallet_1.PRODUCTION_FLAG);
BillRouter.post("/airtime", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded_1, found, currentCash_1, _a, phone_number, amount_1, key, isUser, response_1, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                auth = req.headers.authorization;
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
                found = _c.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, cash_wallet_1.default.findOne({ userID: decoded_1.id })];
            case 2:
                currentCash_1 = ((_b = _c.sent()) !== null && _b !== void 0 ? _b : { currentCash: 0 }).currentCash;
                _a = req.body, phone_number = _a.phone_number, amount_1 = _a.amount, key = _a.key;
                if (currentCash_1 < amount_1) {
                    res.status(401).json({ message: "insufficient fund" });
                    return [2];
                }
                isUser = bcryptjs_1.compareSync(key, found.key);
                if (!isUser) {
                    res.status(400).json({ error: "incorrect key", messagee: "error found", k: { phone_number: phone_number.includes("+") ? phone_number : "+" + phone_number, amount: amount_1, key: key, found: found } });
                    return [2];
                }
                return [4, flw.Bills.create_bill(__assign(__assign({}, exports.payload), { amount: amount_1, customer: phone_number.includes("+") ? phone_number : "+" + phone_number, reference: Math.ceil(Math.random() * 19920392039) }))];
            case 3:
                response_1 = _c.sent();
                if (!response_1.data) return [3, 5];
                return [4, cash_wallet_1.default.updateOne({ userID: decoded_1.id }, { currentCash: currentCash_1 - amount_1 }).then(function () {
                    }).catch(function () {
                        setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, cash_wallet_1.default.updateOne({ userID: decoded_1.id }, { currentCash: currentCash_1 - amount_1 }).then(function () {
                                            res.json({ response: response_1 });
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); }, 3000);
                        res.json({ message: "awaiting" });
                    })];
            case 4:
                _c.sent();
                return [2];
            case 5:
                res.status(401).json({ message: "flutter error", response: response_1 });
                return [3, 7];
            case 6:
                error_1 = _c.sent();
                res.status(500).json({ message: "error found", error: error_1 });
                return [3, 7];
            case 7: return [2];
        }
    });
}); });
BillRouter.post("/data", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded_2, found, currentCash_2, _a, phone_number, amount_2, key, isUser, response_2, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                auth = req.headers.authorization;
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
                found = _c.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, cash_wallet_1.default.findOne({ userID: decoded_2.id })];
            case 2:
                currentCash_2 = ((_b = _c.sent()) !== null && _b !== void 0 ? _b : { currentCash: 0 }).currentCash;
                _a = req.body, phone_number = _a.phone_number, amount_2 = _a.amount, key = _a.key;
                if (currentCash_2 < amount_2) {
                    res.status(401).json({ message: "insufficient fund" });
                    return [2];
                }
                isUser = bcryptjs_1.compareSync(key, found.key);
                if (!isUser) {
                    res.status(400).json({ error: "incorrect key", messagee: "error found", k: { phone_number: phone_number.includes("+") ? phone_number : "+" + phone_number, amount: amount_2, key: key, found: found } });
                    return [2];
                }
                return [4, flw.Bills.create_bill(__assign(__assign({}, exports.payload), { amount: amount_2, customer: phone_number.includes("+") ? phone_number : "+" + phone_number, reference: Math.ceil(Math.random() * 19920392039) }))];
            case 3:
                response_2 = _c.sent();
                res.json({ response: response_2 });
                if (!response_2) return [3, 5];
                return [4, cash_wallet_1.default.updateOne({ userID: decoded_2.id }, { currentCash: currentCash_2 - amount_2 }).then(function () {
                    }).catch(function () {
                        setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, cash_wallet_1.default.updateOne({ userID: decoded_2.id }, { currentCash: currentCash_2 - amount_2 }).then(function () {
                                            res.json({ response: response_2 });
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); }, 3000);
                        res.json({ message: "awaiting" });
                    })];
            case 4:
                _c.sent();
                return [2];
            case 5:
                res.status(401).json({ message: "flutter error", response: response_2 });
                return [3, 7];
            case 6:
                error_2 = _c.sent();
                res.status(500).json({ message: "error found", error: error_2 });
                return [3, 7];
            case 7: return [2];
        }
    });
}); });
BillRouter.post("/transfer", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, currentCash, _a, username, amount, key, playerDetails, isUser, currentCashP2, error_3;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                auth = req.headers.authorization;
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
                found = _d.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, cash_wallet_1.default.findOne({
                        userID: decoded.id,
                    })];
            case 2:
                currentCash = ((_b = (_d.sent())) !== null && _b !== void 0 ? _b : { currentCash: 0 }).currentCash;
                _a = req.body, username = _a.username, amount = _a.amount, key = _a.key;
                if (currentCash < amount) {
                    res.status(401).json({ message: "error found", error: "insuficient fund" });
                    return [2];
                }
                return [4, player_1.default.findOne({ playername: username })];
            case 3:
                playerDetails = _d.sent();
                if (!playerDetails) {
                    res.status(404).json({ message: "error found", error: "user not found" });
                    return [2];
                }
                isUser = bcryptjs_1.compareSync(key, found.key);
                if (!isUser) {
                    res.status(403).json({ message: "error found", error: "incorrect key" });
                    return [2];
                }
                return [4, cash_wallet_1.default.findOne({
                        userID: playerDetails.userID,
                    })];
            case 4:
                currentCashP2 = ((_c = (_d.sent())) !== null && _c !== void 0 ? _c : { currentCash: 0 }).currentCash;
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, { currentCash: currentCash - amount })];
            case 5:
                _d.sent();
                return [4, cash_wallet_1.default.updateOne({ userID: playerDetails.userID }, { currentCash: currentCashP2 + amount })];
            case 6:
                _d.sent();
                res.json({ message: "succesful" });
                return [3, 8];
            case 7:
                error_3 = _d.sent();
                res.status(500).json({ message: "error found", error: error_3 });
                return [3, 8];
            case 8: return [2];
        }
    });
}); });
BillRouter.post("/transfer/direct", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, currentCash, _a, username_1, amount_3, key, playerDetails, isUser, flw_1, bank_name_1, initTrans, error_4;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                auth = req.headers.authorization;
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
                found = _d.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, cash_wallet_1.default.findOne({
                        userID: decoded.id,
                    })];
            case 2:
                currentCash = ((_b = (_d.sent())) !== null && _b !== void 0 ? _b : { currentCash: 0 }).currentCash;
                _a = req.body, username_1 = _a.username, amount_3 = _a.amount, key = _a.key;
                if (currentCash < amount_3) {
                    res.status(401).json({ message: "error found", error: "insuficient fund" });
                    return [2];
                }
                return [4, player_1.default.findOne({ playername: username_1 })];
            case 3:
                playerDetails = _d.sent();
                if (!playerDetails) {
                    res.status(404).json({ message: "error found", error: "user not found" });
                    return [2];
                }
                isUser = bcryptjs_1.compareSync(key, found.key);
                if (!isUser) {
                    res.status(403).json({ message: "error found", error: "incorrect key" });
                    return [2];
                }
                flw_1 = new flutterwave_node_v3_1.default(wallet_1.PUBLIC_KEY, wallet_1.SECRET_KEY);
                return [4, player_1.default.findOne({ userID: decoded.id })];
            case 4:
                bank_name_1 = ((_c = (_d.sent())) !== null && _c !== void 0 ? _c : {
                    bank_name: "",
                }).bank_name;
                initTrans = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var payload_1, response, error_5;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                payload_1 = {
                                    account_bank: "044",
                                    account_number: "0690000040",
                                    amount: 200,
                                    narration: "ionnodo",
                                    currency: "NGN",
                                    reference: "transfer-" + Date.now(),
                                    callback_url: "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
                                    debit_currency: "NGN"
                                };
                                return [4, flw_1.Transfer.initiate(__assign(__assign({}, payload_1), { amount: amount_3, account_number: username_1, account_bank: bank_name_1 }))];
                            case 1:
                                response = _a.sent();
                                res.json({ message: "play" });
                                console.log(response);
                                return [3, 3];
                            case 2:
                                error_5 = _a.sent();
                                console.log(error_5);
                                return [3, 3];
                            case 3: return [2];
                        }
                    });
                }); };
                initTrans();
                return [2];
            case 5:
                _d.sent();
                res.json({ message: "succesful" });
                return [3, 7];
            case 6:
                error_4 = _d.sent();
                res.status(500).json({ message: "error found", error: error_4 });
                return [3, 7];
            case 7: return [2];
        }
    });
}); });
exports.default = BillRouter;
