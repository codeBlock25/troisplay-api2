"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Games = void 0;
var mongoose_1 = require("mongoose");
var Games;
(function (Games) {
    Games[Games["roshambo"] = 0] = "roshambo";
    Games[Games["penalth_card"] = 1] = "penalth_card";
    Games[Games["glory_spin"] = 2] = "glory_spin";
    Games[Games["custom_game"] = 3] = "custom_game";
    Games[Games["matcher"] = 4] = "matcher";
    Games[Games["non"] = 5] = "non";
    Games[Games["lucky_geoge"] = 6] = "lucky_geoge";
    Games[Games["rooms"] = 7] = "rooms";
})(Games = exports.Games || (exports.Games = {}));
var GameSchema = new mongoose_1.Schema({
    gameMemberCount: {
        type: Number,
        required: true,
        default: 1,
    },
    members: {
        type: [String],
        required: true,
    },
    price_in_coin: {
        type: Number,
        required: true,
        default: 0,
    },
    price_in_value: {
        type: Number,
        required: true,
        default: 0,
    },
    gameType: {
        type: String,
        required: true,
        default: "defined",
        lowercase: true,
    },
    gameDetail: {
        type: String,
        lowercase: true,
    },
    gameID: {
        type: Games,
        required: true,
    },
    battleScore: {
        type: Object,
    },
    played: {
        type: Boolean,
        required: true,
        default: false,
    },
    playCount: {
        type: Number,
        default: 1,
    },
    players: {
        type: [
            {
                player_name: String,
                phone_number: String,
                ticket: String,
                winner: Boolean,
            },
        ],
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now(),
    },
});
var GameModel = mongoose_1.model("games", GameSchema);
exports.default = GameModel;
