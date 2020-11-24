"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WiningsType = exports.GameRec = void 0;
var mongoose_1 = require("mongoose");
var GameRec;
(function (GameRec) {
    GameRec[GameRec["win"] = 0] = "win";
    GameRec[GameRec["lose"] = 1] = "lose";
    GameRec[GameRec["draw"] = 2] = "draw";
})(GameRec = exports.GameRec || (exports.GameRec = {}));
var WiningsType;
(function (WiningsType) {
    WiningsType[WiningsType["p1"] = 0] = "p1";
    WiningsType[WiningsType["p2"] = 1] = "p2";
})(WiningsType = exports.WiningsType || (exports.WiningsType = {}));
var playSchema = new mongoose_1.Schema({
    player2ID: {
        type: String,
        required: true,
    },
    isWin: {
        type: GameRec,
        required: true,
    },
    gameID: {
        type: String,
        required: true,
    },
});
var UserPlay = mongoose_1.model("user_play", playSchema);
exports.default = UserPlay;
