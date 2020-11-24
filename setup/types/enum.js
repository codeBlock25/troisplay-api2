"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationHintType = exports.choices = exports.PayType = exports.RoshamboOption = void 0;
var RoshamboOption;
(function (RoshamboOption) {
    RoshamboOption[RoshamboOption["rock"] = 0] = "rock";
    RoshamboOption[RoshamboOption["paper"] = 1] = "paper";
    RoshamboOption[RoshamboOption["scissors"] = 2] = "scissors";
})(RoshamboOption = exports.RoshamboOption || (exports.RoshamboOption = {}));
var PayType;
(function (PayType) {
    PayType[PayType["cash"] = 0] = "cash";
    PayType[PayType["coin"] = 1] = "coin";
})(PayType = exports.PayType || (exports.PayType = {}));
var choices;
(function (choices) {
    choices[choices["at_stated_timed"] = 0] = "at_stated_timed";
    choices[choices["immediately"] = 1] = "immediately";
})(choices = exports.choices || (exports.choices = {}));
var notificationHintType;
(function (notificationHintType) {
    notificationHintType[notificationHintType["withdraw"] = 0] = "withdraw";
    notificationHintType[notificationHintType["fund"] = 1] = "fund";
    notificationHintType[notificationHintType["lost"] = 2] = "lost";
    notificationHintType[notificationHintType["win"] = 3] = "win";
    notificationHintType[notificationHintType["draw"] = 4] = "draw";
})(notificationHintType = exports.notificationHintType || (exports.notificationHintType = {}));
