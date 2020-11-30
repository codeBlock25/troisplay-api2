import { Router, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { sortBy } from "lodash";
import { NotificationAction } from "../function";
import notificationModel, { NotificationType } from "../model/notification";
import users from "../model/users";

const notificationRoute = Router();

const secret: string = process.env.SECRET ?? "";

notificationRoute.get("/all", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization ?? "";
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await notificationModel
      .findOne({ userID: decoded.id })
      .then((notifications) => {
        res.json({
          notifications: {
            ...notifications,
            notifications: sortBy(notifications?.notifications ?? [], {
              time: -1,
            }),
          },
        } as { notifications: NotificationType & Document });
      })
      .catch((error) => {
        res.status(500).json({ error, msssage: "error occured" });
        console.log(error);
      });
  } catch (error) {
    res.status(500).json({ error, msssage: "breakdown" });
    console.log(error);
  }
});

notificationRoute.put("/mark-read", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization ?? "";
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await NotificationAction.markRead({
      userID: decoded.id,
    })
      .then(() => {
        res.json({ message: "mark read" });
      })
      .catch((error) => {
        res.json({ message: "an error occured", error });
        console.log(error);
      });
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
  }
});

export default notificationRoute;
