import { Router, Request, Response } from "express";
import { Document, Error } from "mongoose";
import userModel from "../model/users";
import jwt, { sign, verify } from "jsonwebtoken";
import { genSaltSync, hashSync, compareSync } from "bcryptjs";
import { config } from "dotenv";
import PlayerModel from "../model/player";
import ReferalModel from "../model/referals";
import { generate as rand } from "randomstring";
import WalletModel from "../model/walltet";
import DeviceModel from "../model/device";
import RecordModel from "../model/gamerecord";
import CashWalletModel from "../model/cash_wallet";
import LogModel from "../model/log";
import AdminModel, { AdminLevel } from "../model/admin";

config();

const os = [
  { name: "Windows Phone", value: "Windows Phone", version: "OS" },
  { name: "Windows", value: "Win", version: "NT" },
  { name: "iPhone", value: "iPhone", version: "OS" },
  { name: "iPad", value: "iPad", version: "OS" },
  { name: "Kindle", value: "Silk", version: "Silk" },
  { name: "Android", value: "Android", version: "Android" },
  { name: "PlayBook", value: "PlayBook", version: "OS" },
  { name: "BlackBerry", value: "BlackBerry", version: "/" },
  { name: "Macintosh", value: "Mac", version: "OS X" },
  { name: "Linux", value: "Linux", version: "rv" },
  { name: "Palm", value: "Palm", version: "PalmOS" },
];

const browser = [
  { name: "Chrome", value: "Chrome", version: "Chrome" },
  { name: "Firefox", value: "Firefox", version: "Firefox" },
  { name: "Safari", value: "Safari", version: "Version" },
  { name: "Internet Explorer", value: "MSIE", version: "MSIE" },
  { name: "Opera", value: "Opera", version: "Opera" },
  { name: "BlackBerry", value: "CLDC", version: "CLDC" },
  { name: "Mozilla", value: "Mozilla", version: "Mozilla" },
];

function matchItem(
  string: string,
  data: { name: string; value: string; version: string }[]
): { name: string; value: string; version: string } {
  var i: number = 0,
    regex: RegExp,
    regexv: RegExp,
    match: boolean,
    matches: any,
    version: string;
  for (i = 0; i < data.length; i += 1) {
    regex = new RegExp(data[i].value, "i");
    match = regex.test(string);
    if (match) {
      regexv = new RegExp(data[i].version + "[- /:;]([d._]+)", "i");
      matches = string.match(regexv);
      version = "";
      if (matches) {
        if (matches[1]) {
          matches = matches[1];
        }
      }
      return data[i];
    }
  }
  return {
    name: "unknown",
    value: "unknown",
    version: "unknown",
  };
}

const salt = genSaltSync(5),
  secret = process.env.SECRET || "powemre$#$VESdfver#$#4dfmdpfv",
  userRoute = Router();

userRoute.post("/", async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      phone_number,
      key,
      refer_code,
    }: {
      full_name: string;
      phone_number: string;
      key: string;
      refer_code: string;
    } = req.body;
    let hashedKey = hashSync(key, salt);
    let new_user = new userModel({
      full_name,
      phone_number: phone_number.replace(/(\s)|[+]/g, ""),
      key: hashedKey,
    });
    let referee = await ReferalModel.findOne({
      refer_code: refer_code.toLowerCase(),
    });
    new_user
      .save()
      .then(async (result) => {
        Promise.all([
          referee &&
            (await ReferalModel.updateOne(
              { refer_code },
              { inactiveReferal: referee.inactiveReferal + 1 }
            )),
          await new ReferalModel({
            userID: result._id,
            refer_code: rand({
              length: 7,
              charset: "alphabetic",
            }),
          }).save(),
          await new WalletModel({
            userID: result._id,
          }).save(),
          await new CashWalletModel({
            userID: result._id,
          }).save(),
          await new DeviceModel({
            userID: result._id,
          }).save(),
          await new RecordModel({
            userID: result._id,
          }).save(),
        ])
          .then(() => {
            res.json({ message: "succesful" });
          })
          .catch((error) => {
            userModel.deleteOne({ _id: result._id });
            console.log(error);
          });
          res.json({ message: "content found" });
        })
        .catch((err) => {
          if (err.keyPattern) {
            if (err.keyPattern.phone_number) {
              res.status(400).json({ message: "error found", error: err });
              return;
            }
          }
          res.status(500).json({ message: "error found", error: err });
        });
      } catch (error) {
      console.log(error);
      res.status(500).json({ message: "error found", error });
  }
});

userRoute.post("/login", async (req: Request, res: Response) => {
  try {
    const {
      phone_number,
      key,
    }: { phone_number: string; key: string } = req.body;
    let user: Document | any = await userModel.findOne({
      phone_number: phone_number.replace(/(\s)|[+]/g, ""),
    });
    if (!user) {
      res
        .status(402)
        .json({ message: "error found", error: "incorrect phone number." });
      return;
    }
    let correctKey = compareSync(key, user.key);
    if (!correctKey) {
      res.status(401).json({ message: "error found", error: "incorrect key" });
      return;
    }
    let isPlayer: boolean = Boolean(
      await PlayerModel.findOne({ userID: user._id })
    );
    let token = sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "30 days",
    });
    var agent = req.headers["user-agent"];
    var os_ = matchItem(agent, os).name;
    var browser_ = matchItem(agent, browser).name;
    var device_type = matchItem(agent, os).value;
    await new LogModel({
      userID: user._id,
      browser: browser_,
      os: os_,
      IP: req.ip,
      device_type,
    })
      .save()
      .then(() => {
        res.json({
          message: "content found",
          token,
          isPlayer,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error found", error });
  }
});

userRoute.get("/verify", async (req: Request, res: Response) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(400).json({ message: "error found", error: "empty token" });
    return;
  }
  let token: string = authorization.replace("bearier; ", "");
  if (!token) {
    res.status(400).json({ message: "error found", error: "empty token" });
    return;
  }
  try {
    let decoded: string | object = verify(token, process.env.SECRET);
    res.json({ message: "content found", detail: decoded });
  } catch (error) {
    res.status(404).json({ message: "error found", error: "invalid token" });
    return;
  }
});

userRoute.get("/all", async (_req: Request, res: Response) => {
  try {
    let users: Document[] = await userModel.find();
    res.json({ users, message: "content found" });
  } catch (error) {
    res.status(400).json({ message: "error found", error });
  }
});

userRoute.put("/", async (req: Request, res: Response) => {
  const { token, password } = req.query;
  let t: string | any = token;
  if (t === null || t === undefined || t === "") {
    res.status(400).json({ message: "invalid token", error: "error #419" });
    return;
  }
  let decoded: any = jwt.verify(t, secret);

  await userModel
    .findOneAndUpdate({ _id: decoded.id }, { password })
    .then(() => {
      res.json("");
    })
    .catch((err) => {
      res.status(400).json({ message: "error found", error: err });
    });
});

userRoute.post("/admin/signup", async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      level = AdminLevel.salave,
    }: { email: string; password: string; level: AdminLevel } = req.body;
    let hashedPassword = hashSync(password, salt);
    await new AdminModel({
      email,
      password: hashedPassword,
      level,
    })
      .save()
      .then(() => {
        res.json({ message: "success" });
      })
      .catch((error) => {
        res.status(500).json({ mesage: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

userRoute.post("/admin/login", async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    let admin = await AdminModel.findOne({ email: email.toLowerCase() });
    if (!admin) {
      res.status(404).json({ message: "error found", error: "User not found" });
    }
    let confirmedAdmin: boolean = compareSync(password, admin.password);
    if (!confirmedAdmin) {
      res
        .status(401)
        .json({ message: "error found", error: "incorrect password" });
    }
    let token: string = sign({ adminID: admin._id }, process.env.SECRET, {
      expiresIn: "10 days",
    });
    res.json({ message: "success", token });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

export default userRoute;
