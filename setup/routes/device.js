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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var device_1 = __importDefault(require("../model/device"));
var users_1 = __importDefault(require("../model/users"));
var dotenv_1 = require("dotenv");
var DeviceRouter = express_1.Router();
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
DeviceRouter.post("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userID, isDarkMode, remember, online_status, email_notification, app_notification, mobile_notification, cookies, token, decoded, found, newdevicesetup, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, userID = _a.userID, isDarkMode = _a.isDarkMode, remember = _a.remember, online_status = _a.online_status, email_notification = _a.email_notification, app_notification = _a.app_notification, mobile_notification = _a.mobile_notification;
                cookies = req.cookies;
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
                found = _b.sent();
                if (!found) {
                    res.status(410).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                newdevicesetup = new device_1.default({
                    userID: userID,
                    isDarkMode: isDarkMode,
                    remember: remember,
                    online_status: online_status,
                    email_notification: email_notification,
                    app_notification: app_notification,
                    mobile_notification: mobile_notification,
                });
                return [4, newdevicesetup
                        .save()
                        .then(function (_) { })
                        .catch(function (_) { })];
            case 2:
                _b.sent();
                return [3, 4];
            case 3:
                error_1 = _b.sent();
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
DeviceRouter.get("/personal", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cookies, token, decoded, found, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                cookies = req.cookies;
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
                if (!found) {
                    res.status(410).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                return [4, device_1.default.findOne({ userID: decoded.id })
                        .then(function (setup) {
                        res.json({ message: "content body", setup: setup });
                    })
                        .catch(function (error) {
                        res.status(503).json({ message: "error found", error: error });
                    })];
            case 2:
                _a.sent();
                return [3, 4];
            case 3:
                error_2 = _a.sent();
                console.log(error_2);
                res.status(503).json({ message: "error found", error: error_2 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
DeviceRouter.put("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, isDarkMode, remember, online_status, email_notification, app_notification, mobile_notification, cookies, token, decoded, found, deviceSetup, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, isDarkMode = _a.isDarkMode, remember = _a.remember, online_status = _a.online_status, email_notification = _a.email_notification, app_notification = _a.app_notification, mobile_notification = _a.mobile_notification;
                cookies = req.cookies;
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
                found = _b.sent();
                return [4, device_1.default.findOne({ userID: decoded.id })];
            case 2:
                deviceSetup = _b.sent();
                if (!found) {
                    res.status(410).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                device_1.default.updateOne({ userID: decoded.id }, {
                    isDarkMode: isDarkMode !== null && isDarkMode !== void 0 ? isDarkMode : deviceSetup.isDarkMode,
                    remember: remember !== null && remember !== void 0 ? remember : deviceSetup.remember,
                    online_status: online_status !== null && online_status !== void 0 ? online_status : deviceSetup.online_status,
                    email_notification: email_notification !== null && email_notification !== void 0 ? email_notification : deviceSetup.email_notification,
                    app_notification: app_notification !== null && app_notification !== void 0 ? app_notification : deviceSetup.app_notification,
                    mobile_notification: mobile_notification !== null && mobile_notification !== void 0 ? mobile_notification : deviceSetup.mobile_notification,
                })
                    .then(function () {
                    console.log("done");
                })
                    .catch(function (err) {
                    console.log("Error: " + err);
                })
                    .finally(function () {
                    res.json({ message: "done" });
                });
                return [3, 4];
            case 3:
                error_3 = _b.sent();
                console.log(error_3);
                res.status(503).json({ message: "error found", error: error_3 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
exports.default = DeviceRouter;
