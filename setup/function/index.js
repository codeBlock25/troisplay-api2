"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = exports.FindWinnerOnMatcher = exports.FindWinnerOnRoshambo = exports.MarkRoshamboGame = exports.PlayerDrawCash = exports.PlayerCoinLeft = exports.PlayerCashLeft = exports.PlayerCash = exports.AdminCash = exports.FindWinnerOnPenalty = exports.PlayAdmin = exports.NotificationAction = void 0;
var tslib_1 = require("tslib");
var admin_model_1 = tslib_1.__importDefault(require("../model/admin_model"));
var notification_1 = tslib_1.__importStar(require("../model/notification"));
var plays_1 = require("../model/plays");
var enum_1 = require("../types/enum");
exports.NotificationAction = {
    add: function (_a) {
        var message = _a.message, userID = _a.userID, type = _a.type;
        return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
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
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
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
