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
var jsonwebtoken_1 = require("jsonwebtoken");
var admin_1 = __importDefault(require("../model/admin"));
var games_1 = __importStar(require("../model/games"));
var player_1 = __importDefault(require("../model/player"));
var users_1 = __importDefault(require("../model/users"));
var dotenv_1 = require("dotenv");
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
var MonitorRouter = express_1.Router();
MonitorRouter.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, Admin, players, games, error_1;
    var _a;
    return __generator(this, function (_b) {
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
                        .status(409)
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
MonitorRouter.get("/accounts/data", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, Admin, userslist, admins, error_2;
    var _a;
    return __generator(this, function (_b) {
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
MonitorRouter.get("/games/data", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, Admin, openGames, closeGames, error_3;
    var _a;
    return __generator(this, function (_b) {
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
