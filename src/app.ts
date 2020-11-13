import express, { Application, Request, Response } from "express";
import { json, urlencoded } from "body-parser";
import mongoose from "mongoose";
import cors, { CorsOptions } from "cors";
import { config as envConfig } from "dotenv";
import customRoute from "./routes";
import path from "path";
import fs, { ReadStream } from "fs";
import _ from "lodash";

envConfig();
const server: Application = express();
const port: number | string = process.env.PORT ?? NaN;
const db: string | number = process.env.DATABASE_URI ?? "";

process.on("SIGINT", function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  // some other closing procedures go here
  process.exit(1);
});

server.use(json());
server.use(urlencoded({ extended: true }));

server.use("/test", (_req, res) => {
  res.send("Working");
});


const whitelist: string[] = [
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

var corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin ?? "") !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

server.use("/media", (req: Request, res: Response) => {
  try {
    let acceptable: string[] = ["png", "jpg", "jpeg"];
    let fileLocation: string = path.join(__dirname, req.originalUrl);
    if (!acceptable.includes(_.last(fileLocation.split(".")) ?? "")) {
      res.status(404).send("404");
      return;
    }
    let steam: ReadStream = fs.createReadStream(
      path.join(__dirname, `../static${req.originalUrl}`)
    );
    steam.on("open", () => {
      steam.pipe(res);
    });
    steam.on("error", (err) => {
      res.end(err);
    });
  } catch (error) {
    res.status(404).send(error);
  }
});

server.use(cors(corsOptions));
server.use("/api", customRoute);
mongoose
  .connect(db, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("datebase connected and running well.");
  })
  .catch(console.error);

server.listen(port, () => {
  console.log(
    `server running on http://localhost:${port} and http://127.0.0.1:${port}.`
  );
});