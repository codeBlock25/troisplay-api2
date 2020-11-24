"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = tslib_1.__importDefault(require("express"));
var body_parser_1 = require("body-parser");
var mongoose_1 = tslib_1.__importDefault(require("mongoose"));
var cors_1 = tslib_1.__importDefault(require("cors"));
var dotenv_1 = require("dotenv");
var routes_1 = tslib_1.__importDefault(require("./routes"));
var path_1 = tslib_1.__importDefault(require("path"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var lodash_1 = tslib_1.__importDefault(require("lodash"));
dotenv_1.config();
var server = express_1.default();
var port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : NaN;
var db = (_b = process.env.DATABASE_URI) !== null && _b !== void 0 ? _b : "";
process.on("SIGINT", function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    process.exit(1);
});
server.use(body_parser_1.json());
server.use(body_parser_1.urlencoded({ extended: true }));
server.use("/test", function (_req, res) {
    res.send("Working");
});
var whitelist = [
    "http://192.168.43.41:3000",
    "http://localhost:3000",
    "http://localhost:1027",
    "http://troisplay.com",
    "https://troisplay.com",
    "http://www.troisplay.com",
    "https://www.troisplay.com",
    "http://admin.troisplay.com",
    "https://admin.troisplay.com",
    "http://www.admin.troisplay.com",
    "https://www.admin.troisplay.com",
    "mobile://troisplay.app",
];
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin !== null && origin !== void 0 ? origin : "") !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
};
server.use("/media", function (req, res) {
    var _a;
    try {
        var acceptable = ["png", "jpg", "jpeg"];
        var fileLocation = path_1.default.join(__dirname, req.originalUrl);
        if (!acceptable.includes((_a = lodash_1.default.last(fileLocation.split("."))) !== null && _a !== void 0 ? _a : "")) {
            res.status(404).send("404");
            return;
        }
        var steam_1 = fs_1.default.createReadStream(path_1.default.join(__dirname, "../static" + req.originalUrl));
        steam_1.on("open", function () {
            steam_1.pipe(res);
        });
        steam_1.on("error", function (err) {
            res.end(err);
        });
    }
    catch (error) {
        res.status(404).send(error);
    }
});
server.use(cors_1.default(corsOptions));
server.use("/api", routes_1.default);
mongoose_1.default
    .connect(db, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
    .then(function () {
    console.log("datebase connected and running well.");
})
    .catch(console.error);
server.listen(port, function () {
    console.log("server running on http://localhost:" + port + " and http://127.0.0.1:" + port + ".");
});
