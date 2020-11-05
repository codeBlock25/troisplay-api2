import { Router, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import AdminModel from "../model/admin";
import GameModel, { Games } from "../model/games";
import PlayerModel from "../model/player";
import users from "../model/users";
import { config as envConfig } from "dotenv"

envConfig()
const secret = process.env.SECRET??"";
const MonitorRouter: Router = Router();

MonitorRouter.get("/", async (req: Request, res: Response) => {
  try {
    const auth: string = req.headers.authorization ?? "";
    if (!auth) {
      res.status(401).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token = auth.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "error found", error: "invalid token" });
      return;
    }

    let decoded = (verify(token, secret) as unknown) as {
      adminID: string;
    };
    let Admin = await AdminModel.findById(decoded.adminID);
    if (!Admin) {
      res
        .status(419)
        .json({ message: "error found", error: "invalid admin account" });
      return;
    }
    let players = await PlayerModel.count({});
    let games = await GameModel.count({
      gameID: { $not: { $eq: Games.glory_spin } },
    });
    res.status(200).json({ games, players });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error found", error });
  }
});

MonitorRouter.get("/accounts/data", async (req: Request, res: Response) => {
  try {
    const auth: string = req.headers.authorization ?? "";
    if (!auth) {
      res.status(401).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token = auth.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "error found", error: "invalid token" });
      return;
    }

    let decoded = (verify(token, secret) as unknown) as {
      adminID: string;
    };
    let Admin = await AdminModel.findById(decoded.adminID);
    if (!Admin) {
      res
        .status(419)
        .json({ message: "error found", error: "invalid admin account" });
      return;
    }
    let userslist = await users.find({});
    let admins = await AdminModel.find({});
    res
      .status(200)
      .json({ message: "content found", users: userslist, admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error found", error });
  }
});

MonitorRouter.get("/games/data", async (req: Request, res: Response) => {
  try {
    const auth: string = req.headers.authorization ?? "";
    if (!auth) {
      res.status(401).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token = auth.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "error found", error: "invalid token" });
      return;
    }

    let decoded: any = verify(token, secret);
    let Admin = await AdminModel.findById(decoded.adminID);
    if (!Admin) {
      res
        .status(419)
        .json({ message: "error found", error: "invalid admin account" });
      return;
    }
    let openGames = await GameModel.count({
      gameID: { $not: { $eq: Games.glory_spin } },
      played: false,
    });
    let closeGames = await GameModel.count({
      gameID: { $not: { $eq: Games.glory_spin } },
      played: true,
    });
    res
      .status(200)
      .json({ message: "content found", open: openGames, closed: closeGames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error found", error });
  }
});

export default MonitorRouter;
