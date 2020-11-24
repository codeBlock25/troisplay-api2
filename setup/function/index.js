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
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = exports.FindWinnerOnMatcher = exports.FindWinnerOnRoshambo = exports.MarkRoshamboGame = exports.PlayerDrawCash = exports.PlayerCoinLeft = exports.PlayerCashLeft = exports.PlayerCash = exports.AdminCash = exports.FindWinnerOnPenalty = exports.PlayAdmin = exports.NotificationAction = void 0;
var admin_model_1 = __importDefault(require("../model/admin_model"));
var notification_1 = __importStar(require("../model/notification"));
var plays_1 = require("../model/plays");
var enum_1 = require("../types/enum");
exports.NotificationAction = {
    add: function (_a) {
        var message = _a.message, userID = _a.userID, type = _a.type;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, notification_1.default.updateOne({ userID: userID }, {
                            $push: {
                                notifications: {
                                    message: message,
                                    type: type !== null && type !== void 0 ? type : notification_1.notificationType.game,
                                    time: new Date(),
                                    hasNew: true,
                                },
                            },
                        })];
                    case 1: return [2, _b.sent()];
                }
            });
        });
    },
    markRead: function () { },
};
function PlayAdmin(commission, game_price, AdminCurrentCash, cashRating, memberCount) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, admin_model_1.default.updateOne({}, {
                        currentCash: AdminCash(commission, AdminCurrentCash, game_price, memberCount !== null && memberCount !== void 0 ? memberCount : 2, cashRating),
                    })];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.PlayAdmin = PlayAdmin;
function FindWinnerOnPenalty(p1, p2) {
    var count = 0;
    p1.round1 === p2.round1 ? count++ : count--;
    p1.round2 === p2.round2 ? count++ : count--;
    p1.round3 === p2.round3 ? count++ : count--;
    p1.round4 === p2.round4 ? count++ : count--;
    p1.round5 === p2.round5 ? count++ : count--;
    return count >= 3;
}
exports.FindWinnerOnPenalty = FindWinnerOnPenalty;
function AdminCash(commission, adminCurrentCash, game_price, memberCount, cashRating) {
    return commission.value_in === "$"
        ? adminCurrentCash + commission.value * memberCount
        : commission.value_in === "c"
            ? adminCurrentCash + cashRating * commission.value * memberCount
            : commission.value_in === "%"
                ? adminCurrentCash +
                    (game_price - ((100 - commission.value) / 100) * game_price) * memberCount
                : adminCurrentCash;
}
exports.AdminCash = AdminCash;
function PlayerCash(commission, playerCash, game_price, memberCount, cashRating) {
    return commission.value_in === "$"
        ? playerCash + commission.value * memberCount
        : commission.value_in === "c"
            ? playerCash + cashRating * commission.value * memberCount
            : commission.value_in === "%"
                ? playerCash +
                    (game_price - (commission.value / 100) * game_price) * memberCount
                : playerCash;
}
exports.PlayerCash = PlayerCash;
function PlayerCashLeft(commission, playerCash, game_price, memberCount, cashRating) {
    return commission.value_in === "$"
        ? playerCash + commission.value * memberCount
        : commission.value_in === "c"
            ? playerCash + cashRating * commission.value * memberCount
            : commission.value_in === "%"
                ? playerCash - (game_price - (commission.value / 100) * game_price)
                : playerCash;
}
exports.PlayerCashLeft = PlayerCashLeft;
function PlayerCoinLeft(commission, playerCoin, game_price, memberCount, cashRating) {
    return commission.value_in === "$"
        ? playerCoin + commission.value * memberCount
        : commission.value_in === "c"
            ? playerCoin + cashRating * commission.value * memberCount
            : commission.value_in === "%"
                ? playerCoin -
                    (game_price - (commission.value / 100) * game_price) * memberCount
                : playerCoin;
}
exports.PlayerCoinLeft = PlayerCoinLeft;
function PlayerDrawCash(commission, playerCash, game_price, memberCount, cashRating) {
    return commission.value_in === "$"
        ? playerCash + commission.value * memberCount
        : commission.value_in === "c"
            ? playerCash + cashRating * commission.value * memberCount
            : commission.value_in === "%"
                ? playerCash + (game_price - (commission.value / 100) * game_price) * 1
                : playerCash;
}
exports.PlayerDrawCash = PlayerDrawCash;
function MarkRoshamboGame(p1, p2) {
    var marked = p1 === enum_1.RoshamboOption.scissors && p2 === enum_1.RoshamboOption.rock
        ? plays_1.GameRec.win
        : p1 === enum_1.RoshamboOption.rock && p2 === enum_1.RoshamboOption.paper
            ? plays_1.GameRec.win
            : p1 === enum_1.RoshamboOption.paper && p2 === enum_1.RoshamboOption.scissors
                ? plays_1.GameRec.win
                : p1 === p2
                    ? plays_1.GameRec.draw
                    : plays_1.GameRec.lose;
    return marked;
}
exports.MarkRoshamboGame = MarkRoshamboGame;
function FindWinnerOnRoshambo(p1, p2) {
    var round1 = MarkRoshamboGame(p1.round1, p2.round1), round2 = MarkRoshamboGame(p1.round2, p2.round2), round3 = MarkRoshamboGame(p1.round3, p2.round3), round4 = MarkRoshamboGame(p1.round4, p2.round4), round5 = MarkRoshamboGame(p1.round5, p2.round5), winCount = 0, lossCount = 0, drawCount = 0;
    round1 === plays_1.GameRec.win
        ? winCount++
        : round1 === plays_1.GameRec.draw
            ? drawCount++
            : lossCount++;
    round2 === plays_1.GameRec.win
        ? winCount++
        : round2 === plays_1.GameRec.draw
            ? drawCount++
            : lossCount++;
    round3 === plays_1.GameRec.win
        ? winCount++
        : round3 === plays_1.GameRec.draw
            ? drawCount++
            : lossCount++;
    round4 === plays_1.GameRec.win
        ? winCount++
        : round4 === plays_1.GameRec.draw
            ? drawCount++
            : lossCount++;
    round5 === plays_1.GameRec.win
        ? winCount++
        : round5 === plays_1.GameRec.draw
            ? drawCount++
            : lossCount++;
    var final = drawCount === 5 ||
        (drawCount === 3 && winCount === lossCount) ||
        (drawCount === 1 && winCount === lossCount)
        ? plays_1.GameRec.draw
        : winCount > lossCount
            ? plays_1.GameRec.win
            : plays_1.GameRec.lose;
    return final;
}
exports.FindWinnerOnRoshambo = FindWinnerOnRoshambo;
function FindWinnerOnMatcher(p1, p2) {
    return p1 === p2;
}
exports.FindWinnerOnMatcher = FindWinnerOnMatcher;
function shuffle(array) {
    return array.sort(function () { return Math.random() - 0.5; });
}
exports.shuffle = shuffle;
