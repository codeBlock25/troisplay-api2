import { config as envConfig } from "dotenv";
import { Router, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import RecordModel from "../model/gamerecord";
import users from "../model/users";

const RecordRouter: Router = Router();
envConfig();

RecordRouter.get("/", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(403).json({ message: "error found", error: "invalid auth" });
      return;
    }
    const token = auth.replace("Bearer ", "");
    if (!token) {
      res.status(403).json({ message: "error found", error: "invalid token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET ?? "") as unknown) as {
      id: string;
    };
    let user = await users.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "error found", error: "invalid user" });
      return;
    }
    await RecordModel.find({ userID: decoded.id })
      .sort({ date_mark: -1 })
      .limit(50)
      .then((result) => {
        res.json({ message: "content found", records: result });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

export default RecordRouter;
