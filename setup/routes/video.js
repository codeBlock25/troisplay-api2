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
var dotenv_1 = require("dotenv");
var jsonwebtoken_1 = require("jsonwebtoken");
var video_1 = __importDefault(require("../model/video"));
var admin_1 = __importDefault(require("../model/admin"));
dotenv_1.config();
var VideoRoute = express_1.Router();
VideoRoute.post("", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, admin, _a, link, price, error_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                auth = (_b = req.headers.authorization) !== null && _b !== void 0 ? _b : "";
                if (auth) {
                    res.json({ message: "error", error: "invalid auth" });
                    return [2];
                }
                token = auth.replace("Bearer ", "");
                if (token) {
                    res.json({ message: "error", error: "invalid token" });
                    return [2];
                }
                decoded = jsonwebtoken_1.verify(token, (_c = process.env.SECRET) !== null && _c !== void 0 ? _c : "");
                return [4, admin_1.default.findById(decoded.adminID)];
            case 1:
                admin = _d.sent();
                if (!admin) {
                    res.json({ message: "error", error: "admin not found" });
                    return [2];
                }
                _a = req.body, link = _a.link, price = _a.price;
                return [4, new video_1.default({
                        link: link,
                        price: price,
                    })
                        .save()
                        .then(function (video) {
                        res.json({ video: video });
                    })
                        .catch(function (error) {
                        if (error.keyPattern) {
                            if (error.keyPattern.link) {
                                res.status(400).json({ message: "error found", error: error });
                                return;
                            }
                        }
                        res.status(500).json({ error: error });
                    })];
            case 2:
                _d.sent();
                return [3, 4];
            case 3:
                error_1 = _d.sent();
                res.status(500).json({ error: error_1 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
exports.default = VideoRoute;
