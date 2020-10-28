import { Request, response, Response, Router } from "express";
import { verify } from "jsonwebtoken";
import roomModel, { roomHint } from "../model/rooms";
import { config as envConfig } from "dotenv";
import { update } from "lodash";
import AdminModel from "../model/admin";
import roomQuestionModel, { QuestionsRoomHint } from "../model/room_question";

envConfig();
const secret = process.env.SECRET ?? "";
const RoomRoute = Router();


RoomRoute.delete("/", async (req: Request, res: Response)=>{
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "invalid auth" });
      return;
    }
    const token = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "invalid auth" });
      return;
    }
    let decoded = verify(token, secret) as { adminID: string };
    let admin = await AdminModel.findById(decoded.adminID);

    if (!admin) {
      res.status(406).json({ message: "admin not found" });
      return;
    }
    const id = req.query.id as unknown as string;
    await roomModel.deleteOne({_id: id}).then(()=>{
      res.json({message: "deleted successfully"});
    }).catch(error=>{
      res.status(500).json({message: "error", error});
    })
  } catch (error) {
    res.status(500).json({ error });
  }
})


RoomRoute.post("/", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "invalid auth" });
      return;
    }
    const token = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "invalid auth" });
      return;
    }
    let decoded = verify(token, secret) as { adminID: string };
    let admin = await AdminModel.findById(decoded.adminID);

    if (!admin) {
      res.status(406).json({ message: "admin not found" });
      return;
    }
    const {
      entry_price,
      room_name,
      key_time,
      player_limit,
    }: roomHint = req.body;
    await new roomModel({
      entry_price,
      room_name,
      key_time,
      player_limit,
      addedBy: decoded.adminID,
    })
      .save()
      .then((room) => {
        res.json({ room });
      })
      .catch((error) => {
        if (error.keyPattern.room_name) {
          res.status(403).json({ error });
          return;
        }
        res.status(500).json({ error });
      });
  } catch (error) {
    res.status(500).json({ error });
  }
});

RoomRoute.post("/edit", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "invalid auth" });
      return;
    }
    const token = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "invalid auth" });
      return;
    }
    let decoded = verify(token, secret) as { adminID: string };
    let admin = await AdminModel.findById(decoded.adminID);
    if (!admin) {
      res.status(406).json({ message: "admin not found" });
      return;
    }
    const {
      entry_price,
      room_name,
      key_time,
      player_limit,
      id,
    }: roomHint & { id: string } = req.body;
    await roomModel
      .updateOne(
        { _id: id },
        {
          entry_price,
          room_name,
          key_time,
          player_limit,
        }
      )
      .then(() => {
        res.json({ message: "updated" });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  } catch (error) {
    res.status(500).json({ error });
  }
});


RoomRoute.post("/add-questions", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "invalid auth" });
      return;
    }
    const token = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "invalid auth" });
      return;
    }
    let decoded = verify(token, secret) as { adminID: string };
    let admin = await AdminModel.findById(decoded.adminID);
    if (!admin) {
      res.status(406).json({ message: "admin not found" });
      return;
    }
    const { room_name, questions }: QuestionsRoomHint = req.body;
    await new roomQuestionModel({
      room_name,
      questions,
    })
      .save()
      .then(() => {
        res.json({ message: "saved" });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  } catch (error) {
    res.status(500).json({ error });
  }
});


RoomRoute.get("/", async (_req, res: Response) => {
  await roomModel
    .find({})
    .sort({ date: -1 })
    .then((result) => {
      res.json({ rooms: result });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

export default RoomRoute;
