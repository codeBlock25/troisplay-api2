"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTION_FLAG = exports.banks = exports.SECRET_KEY = exports.PUBLIC_KEY = void 0;
var tslib_1 = require("tslib");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var users_1 = tslib_1.__importDefault(require("../model/users"));
var dotenv_1 = require("dotenv");
var walltet_1 = tslib_1.__importDefault(require("../model/walltet"));
var cash_wallet_1 = tslib_1.__importDefault(require("../model/cash_wallet"));
var flutterwave_node_v3_1 = tslib_1.__importDefault(require("flutterwave-node-v3"));
var admin_model_1 = tslib_1.__importDefault(require("../model/admin_model"));
dotenv_1.config();
var secret = (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "";
exports.PUBLIC_KEY = "FLWPUBK-892063403640cc5691d22bdf9368d89e-X";
exports.SECRET_KEY = "FLWSECK-62f4703237f4d34d5a7f1c03d3e4d72c-X";
exports.banks = [
    { id: 132, code: '560', name: 'Page MFBank' },
    { id: 133, code: '304', name: 'Stanbic Mobile Money' },
    { id: 134, code: '308', name: 'FortisMobile' },
    { id: 135, code: '328', name: 'TagPay' },
    { id: 136, code: '309', name: 'FBNMobile' },
    { id: 137, code: '011', name: 'First Bank of Nigeria' },
    { id: 138, code: '326', name: 'Sterling Mobile' },
    { id: 139, code: '990', name: 'Omoluabi Mortgage Bank' },
    { id: 140, code: '311', name: 'ReadyCash (Parkway)' },
    { id: 141, code: '057', name: 'Zenith Bank' },
    { id: 142, code: '068', name: 'Standard Chartered Bank' },
    { id: 143, code: '306', name: 'eTranzact' },
    { id: 144, code: '070', name: 'Fidelity Bank' },
    { id: 145, code: '023', name: 'CitiBank' },
    { id: 146, code: '215', name: 'Unity Bank' },
    { id: 147, code: '323', name: 'Access Money' },
    { id: 148, code: '302', name: 'Eartholeum' },
    { id: 149, code: '324', name: 'Hedonmark' },
    { id: 150, code: '325', name: 'MoneyBox' },
    { id: 151, code: '301', name: 'JAIZ Bank' },
    { id: 152, code: '050', name: 'Ecobank Plc' },
    { id: 153, code: '307', name: 'EcoMobile' },
    { id: 154, code: '318', name: 'Fidelity Mobile' },
    { id: 155, code: '319', name: 'TeasyMobile' },
    { id: 156, code: '999', name: 'NIP Virtual Bank' },
    { id: 157, code: '320', name: 'VTNetworks' },
    { id: 158, code: '221', name: 'Stanbic IBTC Bank' },
    { id: 159, code: '501', name: 'Fortis Microfinance Bank' },
    { id: 160, code: '329', name: 'PayAttitude Online' },
    { id: 161, code: '322', name: 'ZenithMobile' },
    { id: 162, code: '303', name: 'ChamsMobile' },
    { id: 163, code: '403', name: 'SafeTrust Mortgage Bank' },
    { id: 164, code: '551', name: 'Covenant Microfinance Bank' },
    { id: 165, code: '415', name: 'Imperial Homes Mortgage Bank' },
    { id: 166, code: '552', name: 'NPF MicroFinance Bank' },
    { id: 167, code: '526', name: 'Parralex' },
    { id: 168, code: '035', name: 'Wema Bank' },
    { id: 169, code: '084', name: 'Enterprise Bank' },
    { id: 170, code: '063', name: 'Diamond Bank' },
    { id: 171, code: '305', name: 'Paycom' },
    { id: 172, code: '100', name: 'SunTrust Bank' },
    { id: 173, code: '317', name: 'Cellulant' },
    { id: 174, code: '401', name: 'ASO Savings and & Loans' },
    { id: 175, code: '030', name: 'Heritage' },
    { id: 176, code: '402', name: 'Jubilee Life Mortgage Bank' },
    { id: 177, code: '058', name: 'GTBank Plc' },
    { id: 178, code: '032', name: 'Union Bank' },
    { id: 179, code: '232', name: 'Sterling Bank' },
    { id: 180, code: '076', name: 'Skye Bank' },
    { id: 181, code: '082', name: 'Keystone Bank' },
    { id: 182, code: '327', name: 'Pagatech' },
    { id: 183, code: '559', name: 'Coronation Merchant Bank' },
    { id: 184, code: '601', name: 'FSDH' },
    { id: 185, code: '313', name: 'Mkudi' },
    { id: 186, code: '214', name: 'First City Monument Bank' },
    { id: 187, code: '314', name: 'FET' },
    { id: 188, code: '523', name: 'Trustbond' },
    { id: 189, code: '315', name: 'GTMobile' },
    { id: 190, code: '033', name: 'United Bank for Africa' },
    { id: 191, code: '044', name: 'Access Bank' },
    { id: 567, code: '90115', name: 'TCF MFB' }
];
exports.PRODUCTION_FLAG = false;
var WalletRouter = express_1.Router();
var flw = new flutterwave_node_v3_1.default(exports.PUBLIC_KEY, exports.SECRET_KEY, exports.PRODUCTION_FLAG);
WalletRouter.get("/", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var cookies, token, decoded, found, error_1;
    return tslib_1.__generator(this, function (_a) {
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
                return [4, walltet_1.default.findOne({ userID: decoded.id })
                        .then(function (result) {
                        res.json({
                            message: "content found",
                            wallet: {
                                currentCoin: result === null || result === void 0 ? void 0 : result.currentCoin,
                                pendingCoin: result === null || result === void 0 ? void 0 : result.pendingCoin,
                            },
                        });
                    })
                        .catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 2:
                _a.sent();
                return [3, 4];
            case 3:
                error_1 = _a.sent();
                console.log(error_1);
                res.status(503).json({ message: "error found", error: error_1 });
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
WalletRouter.post("/withdraw", function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var auth, token, decoded, found, amount, currentCash, error_2;
    var _a, _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
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
                found = _c.sent();
                if (!found) {
                    res.status(406).json({ message: "error found", error: "invalid user" });
                    return [2];
                }
                amount = req.body.amount;
                return [4, cash_wallet_1.default.findOne({
                        userID: decoded.id,
                    })];
            case 2:
                currentCash = ((_b = (_c.sent())) !== null && _b !== void 0 ? _b : { currentCash: 0 }).currentCash;
                if (!amount) {
                    res.status(406).json({ message: "invalid input", error: "amount in required" });
                    return [2];
                }
                if (currentCash < amount) {
                    res.status(401).json({ message: "insufficient fund" });
                    return [2];
                }
                return [4, cash_wallet_1.default.updateOne({ userID: decoded.id }, { currentCash: currentCash - amount }).then(function () {
                        res.json({ message: "succesfully" });
                    }).catch(function (error) {
                        res.status(500).json({ message: "error found", error: error });
                    })];
            case 3:
                _c.sent();
                return [3, 5];
            case 4:
                error_2 = _c.sent();
                res.status(500).json({ message: "error found", error: error_2 });
                console.error(error_2);
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
WalletRouter.post("/admin", function (_req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, new admin_model_1.default({}).save()];
            case 1:
                _a.sent();
                res.send("Hello");
                return [2];
        }
    });
}); });
exports.default = WalletRouter;
