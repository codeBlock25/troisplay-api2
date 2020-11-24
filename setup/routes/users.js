"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = require("express");
var mongoose_1 = require("mongoose");
var users_1 = tslib_1.__importDefault(require("../model/users"));
var jsonwebtoken_1 = tslib_1.__importStar(require("jsonwebtoken"));
var bcryptjs_1 = require("bcryptjs");
var dotenv_1 = require("dotenv");
var player_1 = tslib_1.__importDefault(require("../model/player"));
var referals_1 = tslib_1.__importDefault(require("../model/referals"));
var randomstring_1 = require("randomstring");
var walltet_1 = tslib_1.__importDefault(require("../model/walltet"));
var device_1 = tslib_1.__importDefault(require("../model/device"));
var gamerecord_1 = tslib_1.__importDefault(require("../model/gamerecord"));
var cash_wallet_1 = tslib_1.__importDefault(require("../model/cash_wallet"));
var log_1 = tslib_1.__importDefault(require("../model/log"));
var admin_1 = tslib_1.__importStar(require("../model/admin"));
var notification_1 = tslib_1.__importDefault(require("../model/notification"));
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
var os = [
    { name: "Windows Phone", value: "Windows Phone", version: "OS" },
    { name: "Windows", value: "Win", version: "NT" },
    { name: "iPhone", value: "iPhone", version: "OS" },
    { name: "iPad", value: "iPad", version: "OS" },
    { name: "Kindle", value: "Silk", version: "Silk" },
    { name: "Android", value: "Android", version: "Android" },
    { name: "PlayBook", value: "PlayBook", version: "OS" },
    { name: "BlackBerry", value: "BlackBerry", version: "/" },
    { name: "Macintosh", value: "Mac", version: "OS X" },
    { name: "Linux", value: "Linux", version: "rv" },
    { name: "Palm", value: "Palm", version: "PalmOS" },
];
var browser = [
    { name: "Chrome", value: "Chrome", version: "Chrome" },
    { name: "Firefox", value: "Firefox", version: "Firefox" },
    { name: "Safari", value: "Safari", version: "Version" },
    { name: "Internet Explorer", value: "MSIE", version: "MSIE" },
    { name: "Opera", value: "Opera", version: "Opera" },
    { name: "BlackBerry", value: "CLDC", version: "CLDC" },
    { name: "Mozilla", value: "Mozilla", version: "Mozilla" },
];
function matchItem(string, data) {
    var i = 0, regex, regexv, match, matches, version;
    for (i = 0; i < data.length; i += 1) {
        regex = new RegExp(data[i].value, "i");
        match = regex.test(string);
        if (match) {
            regexv = new RegExp(data[i].version + "[- /:;]([d._]+)", "i");
            matches = string.match(regexv);
            version = "";
            if (matches) {
                if (matches[1]) {
                    matches = matches[1];
                }
            }
            return data[i];
        }
    }
    return {
        name: "unknown",
        value: "unknown",
        version: "unknown",
    };
}
var salt = bcryptjs_1.genSaltSync(5), userRoute = express_1.Router();
userRoute.post("/", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, full_name, phone_number, key, refer_code, hashedKey, new_user, referee;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, full_name = _a.full_name, phone_number = _a.phone_number, key = _a.key, refer_code = _a.refer_code;
                hashedKey = bcryptjs_1.hashSync(key, salt);
                new_user = new users_1.default({
                    full_name: full_name,
                    phone_number: phone_number.replace(/(\s)|[+]/g, ""),
                    key: hashedKey,
                });
                return [4, referals_1.default.findOne({
                        refer_code: refer_code.toLowerCase(),
                    })];
            case 1:
                referee = _b.sent();
                new_user
                    .save()
                    .then(function (result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var _a, _b, _c, _d;
                    return tslib_1.__generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                _b = (_a = Promise).all;
                                _c = referee;
                                if (!_c) return [3, 2];
                                return [4, referals_1.default.updateOne({ refer_code: refer_code }, { inactiveReferal: referee.inactiveReferal + 1 })];
                            case 1:
                                _c = (_e.sent());
                                _e.label = 2;
                            case 2:
                                _d = [
                                    _c
                                ];
                                return [4, new referals_1.default({
                                        userID: result._id,
                                        refer_code: randomstring_1.generate({
                                            length: 7,
                                            charset: "alphabetic",
                                        }),
                                    }).save()];
                            case 3:
                                _d = _d.concat([
                                    _e.sent()
                                ]);
                                return [4, new walltet_1.default({
                                        userID: result._id,
                                    }).save()];
                            case 4:
                                _d = _d.concat([
                                    _e.sent()
                                ]);
                                return [4, new notification_1.default({
                                        userID: result._id,
                                        notifications: [],
                                    }).save()];
                            case 5:
                                _d = _d.concat([
                                    _e.sent()
                                ]);
                                return [4, new cash_wallet_1.default({
                                        userID: result._id,
                                    }).save()];
                            case 6:
                                _d = _d.concat([
                                    _e.sent()
                                ]);
                                return [4, new device_1.default({
                                        userID: result._id,
                                    }).save()];
                            case 7:
                                _d = _d.concat([
                                    _e.sent()
                                ]);
                                return [4, new gamerecord_1.default({
                                        userID: result._id,
                                    }).save()];
                            case 8:
                                _b.apply(_a, [_d.concat([
                                        _e.sent()
                                    ])])
                                    .then(function () {
                                    res.json({ message: "content found" });
                                })
                                    .catch(function (error) {
                                    users_1.default.deleteOne({ _id: result._id });
                                    throw new mongoose_1.Error(error);
                                });
                                res.json({ message: "content found" });
                                return [2];
                        }
                    });
                }); })
                    .catch(function (err) {
                    if (err.keyPattern) {
                        if (err.keyPattern.phone_number) {
                            res.status(400).json({ message: "error found", error: err });
                            return;
                        }
                    }
                    res.status(500).json({ message: "error found", error: err });
                });
                return [2];
        }
    });
}); });
userRoute.post("/login", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, phone_number, key, user, correctKey, isPlayer_1, _b, token_1, agent, os_, browser_, device_type, error_1;
    var _c;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                _a = req.body, phone_number = _a.phone_number, key = _a.key;
                return [4, users_1.default.findOne({
                        phone_number: phone_number.replace(/(\s)|[+]/g, ""),
                    })];
            case 1:
                user = _d.sent();
                if (!user) {
                    res
                        .status(402)
                        .json({ message: "error found", error: "incorrect phone number." });
                    return [2];
                }
                correctKey = bcryptjs_1.compareSync(key, user.key);
                if (!correctKey) {
                    res.status(401).json({ message: "error found", error: "incorrect key" });
                    return [2];
                }
                _b = Boolean;
                return [4, player_1.default.findOne({ userID: user._id })];
            case 2:
                isPlayer_1 = _b.apply(void 0, [_d.sent()]);
                token_1 = jsonwebtoken_1.sign({ id: user._id }, secret, {
                    expiresIn: "30 days",
                });
                agent = (_c = req.headers["user-agent"]) !== null && _c !== void 0 ? _c : "";
                os_ = matchItem(agent, os).name;
                browser_ = matchItem(agent, browser).name;
                device_type = matchItem(agent, os).value;
                return [4, new log_1.default({
                        userID: user._id,
                        browser: browser_,
                        os: os_,
                        IP: req.ip,
                        device_type: device_type,
                    })
                        .save()
                        .then(function () {
                        res.json({
                            message: "content found",
                            token: token_1,
                            isPlayer: isPlayer_1,
                        });
                    })
                        .catch(function (error) {
                        console.error(error);
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 3:
                _d.sent();
                return [3, 5];
            case 4:
                error_1 = _d.sent();
                console.error(error_1);
                res.status(500).json({ message: "error found", error: error_1 });
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
userRoute.get("/verify", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var authorization, token, decoded;
    return tslib_1.__generator(this, function (_a) {
        authorization = req.headers.authorization;
        if (!authorization) {
            res.status(400).json({ message: "error found", error: "empty token" });
            return [2];
        }
        token = authorization.replace("bearier; ", "");
        if (!token) {
            res.status(400).json({ message: "error found", error: "empty token" });
            return [2];
        }
        try {
            decoded = jsonwebtoken_1.verify(token, secret);
            res.json({ message: "content found", detail: decoded });
        }
        catch (error) {
            res.status(404).json({ message: "error found", error: "invalid token" });
            return [2];
        }
        return [2];
    });
}); });
userRoute.get("/all", function (_req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var users, error_2;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, users_1.default.find()];
            case 1:
                users = _a.sent();
                res.json({ users: users, message: "content found" });
                return [3, 3];
            case 2:
                error_2 = _a.sent();
                res.status(400).json({ message: "error found", error: error_2 });
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
userRoute.put("/", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, token, password, t, decoded;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, token = _a.token, password = _a.password;
                t = token;
                if (t === null || t === undefined || t === "") {
                    res.status(400).json({ message: "invalid token", error: "error #419" });
                    return [2];
                }
                decoded = jsonwebtoken_1.default.verify(t, secret);
                return [4, users_1.default
                        .findOneAndUpdate({ _id: decoded.id }, { password: password })
                        .then(function () {
                        res.json("");
                    })
                        .catch(function (err) {
                        res.status(400).json({ message: "error found", error: err });
                    })];
            case 1:
                _b.sent();
                return [2];
        }
    });
}); });
userRoute.post("/admin/signup", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, _b, level, hashedPassword, error_3;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, email = _a.email, password = _a.password, _b = _a.level, level = _b === void 0 ? admin_1.AdminLevel.salave : _b;
                hashedPassword = bcryptjs_1.hashSync(password, salt);
                return [4, new admin_1.default({
                        email: email,
                        password: hashedPassword,
                        level: level,
                    })
                        .save()
                        .then(function () {
                        res.json({ message: "success" });
                    })
                        .catch(function (error) {
                        res.status(500).json({ mesage: "error found", error: error });
                    })];
            case 1:
                _c.sent();
                return [3, 3];
            case 2:
                error_3 = _c.sent();
                res.status(500).json({ message: "error found", error: error_3 });
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
userRoute.post("/admin/login", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, admin, confirmedAdmin, token, error_4;
    var _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4, admin_1.default.findOne({ email: email.toLowerCase() })];
            case 1:
                admin = _c.sent();
                if (!admin) {
                    res.status(404).json({ message: "error found", error: "User not found" });
                }
                confirmedAdmin = bcryptjs_1.compareSync(password, (_b = admin === null || admin === void 0 ? void 0 : admin.password) !== null && _b !== void 0 ? _b : "");
                if (!confirmedAdmin) {
                    res
                        .status(401)
                        .json({ message: "error found", error: "incorrect password" });
                }
                token = jsonwebtoken_1.sign({ adminID: admin === null || admin === void 0 ? void 0 : admin._id }, secret, {
                    expiresIn: "10 days",
                });
                res.json({ message: "success", token: token });
                return [3, 3];
            case 2:
                error_4 = _c.sent();
                res.status(500).json({ message: "error found", error: error_4 });
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
exports.default = userRoute;
