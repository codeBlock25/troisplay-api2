import { Router, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { Document, Error } from "mongoose";
import DeviceModel, { deviceType } from "../model/device";
import users from "../model/users";
import { config as envConfig } from "dotenv";

const DeviceRouter: Router = Router();
envConfig();
const secret = process.env.SECRET ?? "";

export interface IDevice {
  userID: string;
  isDarkMode: string;
  remember: boolean;
  online_status: boolean;
  email_notification: boolean;
  app_notification: boolean;
  mobile_notification: boolean;
}

DeviceRouter.post("/", async (req: Request, res: Response) => {
  try {
    const {
      userID,
      isDarkMode,
      remember,
      online_status,
      email_notification,
      app_notification,
      mobile_notification,
    }: IDevice = req.body;

    let cookies: { token: string } = req.cookies;
    if (!cookies) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = cookies?.token;
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: string | object | any = verify(token, secret);
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let newdevicesetup: Document = new DeviceModel({
      userID,
      isDarkMode,
      remember,
      online_status,
      email_notification,
      app_notification,
      mobile_notification,
    });
    await newdevicesetup
      .save()
      .then((_) => {})
      .catch((_) => {});
  } catch (error) {}
});

DeviceRouter.get("/personal", async (req: Request, res: Response) => {
  try {
    let cookies: { token: string } = req.cookies;
    if (!cookies) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = cookies?.token;
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: string | object | any = verify(token, secret);
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await DeviceModel.findOne({ userID: decoded.id })
      .then((setup) => {
        res.json({ message: "content body", setup });
      })
      .catch((error: Error) => {
        res.status(503).json({ message: "error found", error });
      });
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: "error found", error });
  }
});

DeviceRouter.put("/", async (req: Request, res: Response) => {
  try {
    let {
      isDarkMode,
      remember,
      online_status,
      email_notification,
      app_notification,
      mobile_notification,
    }: IDevice = req.body;
    let cookies: { token: string } = req.cookies;
    if (!cookies) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = cookies?.token;
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: string | object | any = verify(token, secret);
    let found = await users.findById(decoded.id);
    let deviceSetup: any = await DeviceModel.findOne({ userID: decoded.id });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    DeviceModel.updateOne(
      { userID: decoded.id },
      {
        isDarkMode: isDarkMode ?? deviceSetup.isDarkMode,
        remember: remember ?? deviceSetup.remember,
        online_status: online_status ?? deviceSetup.online_status,
        email_notification:
          email_notification ?? deviceSetup.email_notification,
        app_notification: app_notification ?? deviceSetup.app_notification,
        mobile_notification:
          mobile_notification ?? deviceSetup.mobile_notification,
      }
    )
      .then(() => {
        console.log("done");
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
      })
      .finally(() => {
        res.json({ message: "done" });
      });
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: "error found", error });
  }
});
export default DeviceRouter;
