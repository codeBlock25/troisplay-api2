import { Router, Request, Response } from "express";
import { config as envConfig } from "dotenv";
import { verify } from "jsonwebtoken";
import VideoModel from "../model/video";
import AdminModel from "../model/admin";

envConfig();

const VideoRoute = Router();

VideoRoute.post("", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization ?? "";
    if (auth) {
      res.json({ message: "error", error: "invalid auth" });
      return;
    }
    const token = auth.replace("Bearer ", "");
    if (token) {
      res.json({ message: "error", error: "invalid token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET ?? "") as unknown) as {
      adminID: string;
    };
    let admin = await AdminModel.findById(decoded.adminID);

    if (!admin) {
      res.json({ message: "error", error: "admin not found" });
      return;
    }
    const { link, price }: { link: string; price: number } = req.body;
    await new VideoModel({
      link,
      price,
    })
      .save()
      .then((video) => {
        res.json({ video });
      })
      .catch((error) => {
        if (error.keyPattern) {
          if (error.keyPattern.link) {
            res.status(400).json({ message: "error found", error: error });
            return;
          }
        }
        res.status(500).json({ error });
      });
  } catch (error) {
    res.status(500).json({ error });
  }
});


export default VideoRoute;