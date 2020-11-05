import { Router, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { Document } from "mongoose";
import ReferalModel from "../model/referals";
import users from "../model/users";
import { config as envConfig } from "dotenv";

envConfig();
const secret = process.env.SECRET ?? ""
const ReferalRoute: Router = Router();

ReferalRoute.put("/up-active", async (req: Request, res: Response) => {
  try {
    let cookies: { token: string } = req.cookies;
    let { refer_code } = (req.query as unknown) as { refer_code: string };
    if (!cookies) {
      res.status(410).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = cookies?.token;
    if (!token || token === "") {
      res.status(410).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: string | object | any = verify(token, secret);
    let found = await users.findById(decoded.id);
    let refel_data = await ReferalModel.findOne({ userID: decoded.id });
    if (!found) {
      res.status(410).json({ message: "error found", error: "invalid user" });
      return;
    }
    await ReferalModel.updateOne(
      {
        refer_code,
      },
      {
        activeReferal: (refel_data?.activeReferal ?? 0) + 1,
        inactiveReferal: (refel_data?.inactiveReferal ?? 0) - 1,
      }
    )
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        res.json({ message: "done" });
      });
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: "error found", error });
  }
});

ReferalRoute.put("/up-inactive", async (req: Request, res: Response) => {
  try {
    let cookies: { token: string } = req.cookies;
    let { refer_code } = (req.query as unknown) as { refer_code: string };
    if (!cookies) {
      res.status(410).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = cookies?.token;
    if (!token || token === "") {
      res.status(410).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: string | object | any = verify(token, secret);
    let found = await users.findById(decoded.id);
    let refel_data: any = await ReferalModel.findOne({ userID: decoded.id });
    if (!found) {
      res.status(410).json({ message: "error found", error: "invalid user" });
      return;
    }
    await ReferalModel.updateOne(
      {
        refer_code,
      },
      {
        inactiveReferal: refel_data.inactiveReferal + 1,
      }
    )
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        res.json({ message: "done" });
      });
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: "error found", error });
  }
});

ReferalRoute.get("/", async (req: Request, res: Response) => {
  console.log(req.cookies, req.headers.cookie);
  res.send("done");
});

export default ReferalRoute;
