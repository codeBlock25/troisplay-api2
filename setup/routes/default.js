"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var default_1 = __importDefault(require("../model/default"));
var dotenv_1 = require("dotenv");
var jsonwebtoken_1 = require("jsonwebtoken");
var admin_1 = __importDefault(require("../model/admin"));
var defaultRouter = express_1.Router();
dotenv_1.config();
defaultRouter.post("/init", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, commission_value_custom, commission_value_guess_master, commission_value_in_custom, commission_value_in_guess_master, commission_value_in_penalty, commission_value_in_roshambo, commission_value_penalty, commission_value_roshambo, cashRating, min_stack_roshambo, min_stack_penalty, min_stack_guess_master, min_stack_custom, referRating, count, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, commission_value_custom = _a.commission_value_custom, commission_value_guess_master = _a.commission_value_guess_master, commission_value_in_custom = _a.commission_value_in_custom, commission_value_in_guess_master = _a.commission_value_in_guess_master, commission_value_in_penalty = _a.commission_value_in_penalty, commission_value_in_roshambo = _a.commission_value_in_roshambo, commission_value_penalty = _a.commission_value_penalty, commission_value_roshambo = _a.commission_value_roshambo, cashRating = _a.cashRating, min_stack_roshambo = _a.min_stack_roshambo, min_stack_penalty = _a.min_stack_penalty, min_stack_guess_master = _a.min_stack_guess_master, min_stack_custom = _a.min_stack_custom, referRating = _a.referRating;
                return [4, default_1.default.countDocuments({})];
            case 1:
                count = _b.sent();
                if (count >= 1) {
                    res
                        .status(400)
                        .json({ message: "can't initialize more then two default record" });
                    return [2];
                }
                return [4, new default_1.default({
                        commission_roshambo: {
                            value: commission_value_roshambo,
                            value_in: commission_value_in_roshambo,
                        },
                        commission_penalty: {
                            value: commission_value_penalty,
                            value_in: commission_value_in_penalty,
                        },
                        commission_guess_mater: {
                            value: commission_value_guess_master,
                            value_in: commission_value_in_guess_master,
                        },
                        commission_custom_game: {
                            value: commission_value_custom,
                            value_in: commission_value_in_custom,
                        },
                        cashRating: cashRating,
                        min_stack_roshambo: min_stack_roshambo,
                        min_stack_penalty: min_stack_penalty,
                        min_stack_guess_master: min_stack_guess_master,
                        min_stack_custom: min_stack_custom,
                        referRating: referRating,
                    })
                        .save()
                        .then(function () {
                        res.json({ message: "defaults initailized" });
                    })
                        .catch(function (error) {
                        res.status(500).json({
                            message: "error found",
                            error: error,
                        });
                    })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_1 = _b.sent();
                res.status(500).json({ error: error_1 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
defaultRouter.put("/update", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, adminID, admin, _a, commission_value_custom, commission_value_guess_master, commission_value_in_custom, commission_value_in_guess_master, commission_value_in_penalty, commission_value_in_roshambo, commission_value_penalty, commission_value_roshambo, cashRating, min_stack_roshambo, min_stack_penalty, min_stack_guess_master, min_stack_custom, referRating, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                auth = req.headers.authorization;
                if (!auth) {
                    res.status(406).json({
                        message: "error found",
                        error: "invalid auth",
                    });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (!token) {
                    res.status(406).json({
                        message: "error found",
                        error: "invalid token",
                    });
                    return [2];
                }
                adminID = jsonwebtoken_1.verify(token, (_b = process.env.SECRET) !== null && _b !== void 0 ? _b : "").adminID;
                admin = admin_1.default.findById(adminID);
                if (!admin) {
                    res.status(406).json({
                        message: "error found",
                        error: "user not found",
                    });
                    return [2];
                }
                _a = req.query, commission_value_custom = _a.commission_value_custom, commission_value_guess_master = _a.commission_value_guess_master, commission_value_in_custom = _a.commission_value_in_custom, commission_value_in_guess_master = _a.commission_value_in_guess_master, commission_value_in_penalty = _a.commission_value_in_penalty, commission_value_in_roshambo = _a.commission_value_in_roshambo, commission_value_penalty = _a.commission_value_penalty, commission_value_roshambo = _a.commission_value_roshambo, cashRating = _a.cashRating, min_stack_roshambo = _a.min_stack_roshambo, min_stack_penalty = _a.min_stack_penalty, min_stack_guess_master = _a.min_stack_guess_master, min_stack_custom = _a.min_stack_custom, referRating = _a.referRating;
                return [4, default_1.default
                        .updateOne({}, {
                        commission_roshambo: {
                            value: commission_value_roshambo,
                            value_in: commission_value_in_roshambo,
                        },
                        commission_penalty: {
                            value: commission_value_penalty,
                            value_in: commission_value_in_penalty,
                        },
                        commission_guess_mater: {
                            value: commission_value_guess_master,
                            value_in: commission_value_in_guess_master,
                        },
                        commission_custom_game: {
                            value: commission_value_custom,
                            value_in: commission_value_in_custom,
                        },
                        cashRating: cashRating,
                        min_stack_roshambo: min_stack_roshambo,
                        min_stack_penalty: min_stack_penalty,
                        min_stack_guess_master: min_stack_guess_master,
                        min_stack_custom: min_stack_custom,
                        referRating: referRating,
                    })
                        .then(function () {
                        res.json({
                            message: "defaults updated successfully",
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({
                            message: "error found",
                            error: error,
                        });
                    })];
            case 1:
                _c.sent();
                return [3, 3];
            case 2:
                error_2 = _c.sent();
                res.status(500).json({ message: "error found", error: error_2 });
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
defaultRouter.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, default_1.default
                        .findOne({})
                        .then(function (result) {
                        res.json({
                            message: "content found",
                            default: result,
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 1:
                _a.sent();
                return [3, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ message: "error found", error: error_3 });
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
exports.default = defaultRouter;
