"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var jsonwebtoken_1 = require("jsonwebtoken");
var video_1 = tslib_1.__importDefault(require("../model/video"));
var admin_1 = tslib_1.__importDefault(require("../model/admin"));
dotenv_1.config();
var VideoRoute = express_1.Router();
VideoRoute.post("", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, admin, _a, link, price, error_1;
    var _b, _c;
    return tslib_1.__generator(this, function (_d) {
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
