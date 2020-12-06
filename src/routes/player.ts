import { Router, Response, Request } from "express";
import PlayerModel, { playerType } from "../model/player";
import multer, { diskStorage, StorageEngine } from "multer";
import { sign, verify } from "jsonwebtoken";
import { config as envConfig } from "dotenv";
import users from "../model/users";
import DeviceModel from "../model/device";
import RecordModel from "../model/gamerecord";
import ReferalModel from "../model/referals";
import WalletModel from "../model/walltet";
import { genSaltSync, hashSync } from "bcryptjs";
import CashWalletModel from "../model/cash_wallet";
const salt = genSaltSync(10);

envConfig();
const secret = process.env.SECRET ?? "";
const storage: StorageEngine = diskStorage({
  destination: function (_req: Request, _file: any, cb: Function) {
    cb(null, "static/media");
  },
  filename: function (_req: Request, file: any, cb: Function) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        `.${file.mimetype.split("/")[1] ?? "png"}`
    );
  },
});

const upload = multer({ storage: storage });

const PlayerRouter: Router = Router();

interface PlayerType {
  playerpic?: string;
  playername: string;
  email: string;
  about_me: string;
  location: string;
  isConfirmPolicy?: boolean;
  bank_name: string;
  account_number: string;
  recovery_question: string;
  recovery_answer: string;
}

PlayerRouter.post(
  "/new",
  upload.single("profile-pic"),
  async (req: Request, res: Response) => {
    try {
      let auth: string = req.headers.authorization ?? "";
      if (!auth) {
        res.status(410).json({ message: "error found", error: "invalid auth" });
        return;
      }
      let token: string = auth.replace("Bearer ", "");
      if (!token || token === "") {
        res.status(410).json({ message: "error found", error: "empty token" });
        return;
      }
      let decoded: string | object | any = verify(token, secret);
      let found = await users.findById(decoded.id);
      let deviceSetup = await DeviceModel.findOne({ userID: decoded.id });
      let gamerecord = await RecordModel.find({ userID: decoded.id })
        .sort({ date_mark: -1 })
        .limit(10);
      let referal = await ReferalModel.findOne({ userID: decoded.id });
      let wallet = await WalletModel.findOne({ userID: decoded.id });
      const {
        playername,
        email,
        location,
        bank_name,
        account_number,
        recovery_question,
        recovery_answer,
      }: PlayerType = req.body;
      if (!found) {
        res.status(410).json({ message: "error found", error: "invalid user" });
        return;
      }
      let newplayer: playerType;
      if (req.file) {
        newplayer = new PlayerModel({
          userID: decoded.id,
          playername,
          playerpic: `media/${req.file.filename}`,
          email,
          location,
          bank_name,
          account_number,
          recovery_question,
          recovery_answer,
        });
      } else {
        newplayer = new PlayerModel({
          userID: decoded.id,
          playername,
          email,
          location,
          bank_name,
          account_number,
          recovery_question,
          recovery_answer,
        });
      }
      await newplayer
        .save()
        .then((result) => {
          res.json({
            message: "successful",
            player: {
              userID: decoded.id,
              playerpic: result.playerpic,
              playername: result.playername,
              email: result.email,
              about_me: result.about_me,
              location: result.location,
              bank_name: result.bank_name,
              account_number: result.account_number,
            },
            deviceSetup,
            referal,
            wallet,
            gamerecord,
          });
        })
        .catch((err) => {
          if (err.keyPattern.playername) {
            res.status(400).json({ message: "error found", error: err });
            return;
          }
          if (err.keyPattern.userID) {
            res.status(402).json({ message: "error found", error: err });
            return;
          }
          res.status(503).json({ message: "error found", error: err });
        });
    } catch (error) {
      console.error(error);
    }
  }
);

PlayerRouter.get("/records", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization ?? "";
    if (!auth) {
      res.status(410).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(410).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: string | object | any = verify(token, secret);
    let user_ = await users.findById(decoded.id);
    let found = await PlayerModel.findOne({
      userID: decoded.id,
    });
    let deviceSetup = await DeviceModel.findOne({ userID: decoded.id });
    let gamerecord = await RecordModel.find({ userID: decoded.id })
      .sort({ date_mark: -1 })
      .limit(30);
    let referal = await ReferalModel.findOne({ userID: decoded.id });
    let wallet = await WalletModel.findOne({ userID: decoded.id });
    let cashwallet = await CashWalletModel.findOne({ userID: decoded.id });
    if (!found) {
      res
        .status(410)
        .json({ message: "errornn found", error: "invalid_ user" });
      return;
    }
    res.json({
      message: "content found",
      user: {
        full_name: user_?.full_name,
        phone_number: user_?.phone_number,
      },
      player: {
        userID: decoded.id,
        full_name: user_?.full_name,
        phone_number: user_?.phone_number,
        playerpic: found.playerpic,
        playername: found.playername,
        email: found.email,
        location: found.location,
      },
      deviceSetup,
      referal,
      wallet,
      gamerecord,
      cashwallet,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

PlayerRouter.post("/forgot", async (req: Request, res: Response) => {
  const { phone_number }: { phone_number: string } = req.body;
  let user = await users.findOne({
    phone_number: phone_number.replace("+", "").replace(" ", ""),
  });
  if (!user) {
    res.status(403).json({ message: "error found", error: "user not found" });
    return;
  }
  let player: any = await PlayerModel.findOne({ userID: user._id });
  if (!player) {
    res.status(401).json({ message: "error found", error: "player not found" });
    return;
  }
  res.json({
    message: "content found",
    content: {
      recovery_question: player.recovery_question,
    },
  });
});

PlayerRouter.post("/forgot/confirm", async (req: Request, res: Response) => {
  const {
    phone_number,
    answer,
  }: { phone_number: string; answer: string } = req.body;
  let user = await users.findOne({
    phone_number: phone_number.replace("+", "").replace(" ", ""),
  });
  if (!user) {
    res.status(404).json({ message: "error found", error: "user not found" });
    return;
  }
  let player: any = await PlayerModel.findOne({ userID: user._id });
  if (!player) {
    res.status(401).json({ message: "error found", error: "player not found" });
    return;
  }
  if (player.recovery_answer === answer) {
    let token = sign({ playerID: player.userID }, secret, {
      expiresIn: "3 hours",
    });
    res.json({
      message: "content found",
      token,
    });
    return;
  }
  res.status(401).json({ message: "error found", error: "incorrect answer" });
});

PlayerRouter.post("/forgot/update", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization ?? "";
    if (!auth) {
      res.status(410).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(410).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: string | object | any = verify(token, secret);
    const { betting_key }: { betting_key: string } = req.body;
    let hashedKey = hashSync(betting_key, salt);
    await users
      .updateOne(
        { _id: decoded.playerID },
        {
          key: hashedKey,
        }
      )
      .then(() => {
        res.json({ message: "successful" });
      })
      .catch((error) => {
        res.json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

export default PlayerRouter;
