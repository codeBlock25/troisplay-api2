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
const port: number | string = process.env.PORT;
const db: string | number = process.env.DATABASE_URI;

server.use(json());
server.use(urlencoded({ extended: false }));

server.use("/test", (req, res) => {
  res.send("Working");
});

const whitelist: string[] = [
  "http://localhost:1027",
  "http://67.205.179.49:3000",
  "http://troisplay.com",
  "http://www.troisplay.com",
  "mobile://troisplay.app",
  "web://troisplay.app",
  "https://overwatch-troisplay.vercel.app",
];
var corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
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
    if (!acceptable.includes(_.last(fileLocation.split(".")))) {
      res.status(404).send("404");
      return;
    }
    let steam: ReadStream = fs.createReadStream(
      path.join(__dirname, req.originalUrl)
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

server.use(cors());
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