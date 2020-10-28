import { Router, Request, Response } from "express";
import defaultModel from "../model/default";
import { config as envConfig } from "dotenv";
import { verify } from "jsonwebtoken";
import AdminModel from "../model/admin";

const defaultRouter: Router = Router();
envConfig();
export interface successResHint {
  message: string;
}
export interface errorResHint<T = any> {
  message: "error found" | "not allowed";
  error: T;
}

defaultRouter.post("/init", async (req: Request, res: Response) => {
  try {
    const {
      key,
      commission_value_custom,
      commission_value_guess_master,
      commission_value_in_custom,
      commission_value_in_guess_master,
      commission_value_in_penalty,
      commission_value_in_roshambo,
      commission_value_penalty,
      commission_value_roshambo,
      cashRating,
      min_stack_roshambo,
      min_stack_penalty,
      min_stack_guess_master,
      min_stack_custom,
      referRating,
    }: {
      key: string;
      commission_value_roshambo: number;
      commission_value_in_roshambo: "$" | "%" | "c";
      commission_value_penalty: number;
      commission_value_in_penalty: "$" | "%" | "c";
      commission_value_guess_master: number;
      commission_value_in_guess_master: "$" | "%" | "c";
      commission_value_custom: number;
      commission_value_in_custom: "$" | "%" | "c";
      cashRating: number;
      min_stack_roshambo: number;
      min_stack_penalty: number;
      min_stack_guess_master: number;
      min_stack_custom: number;
      referRating: number;
    } = req.body;
    if (
      key !== process.env.KEY ||
      key === undefined ||
      key === null ||
      key === ""
    ) {
      res
        .status(406)
        .json({
          message: "not allowed",
          error: "#40010",
          key: process.env.KEY,
          ty: typeof process.env.KEY,
        } as errorResHint);
      return;
    }
    let count = await defaultModel.countDocuments({});
    if (count >= 1) {
      res
        .status(400)
        .json({ message: "can't initialize more then two default record" });
      return;
    }
    await new defaultModel({
      commission_roshambo: {
        value: commission_value_roshambo,
        value_in: commission_value_in_roshambo,
      },
      commission_penalty: {
        value: commission_value_penalty,
        value_in: commission_value_in_penalty,
      },
      commission_guess_mater: {
        value: commission_value_guess_master,
        value_in: commission_value_in_guess_master,
      },
      commission_custom_game: {
        value: commission_value_custom,
        value_in: commission_value_in_custom,
      },
      cashRating,
      min_stack_roshambo,
      min_stack_penalty,
      min_stack_guess_master,
      min_stack_custom,
      referRating,
    })
      .save()
      .then(() => {
        res.json({ message: "defaults initailized" } as successResHint);
      })
      .catch((error) => {
        res.status(500).json({
          message: "error found",
          error,
        } as errorResHint);
      });
  } catch (error) {
    res.status(500).json({ error });
  }
});

defaultRouter.put("/update", async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({
        message: "error found",
        error: "invalid auth",
      } as errorResHint);
      return;
    }
    const token = auth.replace("Bearer ", "");
    if (!token) {
      res.status(406).json({
        message: "error found",
        error: "invalid token",
      } as errorResHint);
      return;
    }
    let { adminID } = verify(token, process.env.SECRET) as { adminID: string };
    let admin = AdminModel.findById(adminID);
    if (!admin) {
      res.status(406).json({
        message: "error found",
        error: "user not found",
      } as errorResHint);
      return;
    }
    const {
      commission_value_custom,
      commission_value_guess_master,
      commission_value_in_custom,
      commission_value_in_guess_master,
      commission_value_in_penalty,
      commission_value_in_roshambo,
      commission_value_penalty,
      commission_value_roshambo,
      cashRating,
      min_stack_roshambo,
      min_stack_penalty,
      min_stack_guess_master,
      min_stack_custom,
      referRating,
    } = (req.query as unknown) as {
      commission_value_roshambo: number;
      commission_value_in_roshambo: "$" | "%" | "c";
      commission_value_penalty: number;
      commission_value_in_penalty: "$" | "%" | "c";
      commission_value_guess_master: number;
      commission_value_in_guess_master: "$" | "%" | "c";
      commission_value_custom: number;
      commission_value_in_custom: "$" | "%" | "c";
      cashRating: number;
      min_stack_roshambo: number;
      min_stack_penalty: number;
      min_stack_guess_master: number;
      min_stack_custom: number;
      referRating: number;
    };
    await defaultModel
      .updateOne(
        {},
        {
          commission_roshambo: {
            value: commission_value_roshambo,
            value_in: commission_value_in_roshambo,
          },
          commission_penalty: {
            value: commission_value_penalty,
            value_in: commission_value_in_penalty,
          },
          commission_guess_mater: {
            value: commission_value_guess_master,
            value_in: commission_value_in_guess_master,
          },
          commission_custom_game: {
            value: commission_value_custom,
            value_in: commission_value_in_custom,
          },
          cashRating,
          min_stack_roshambo,
          min_stack_penalty,
          min_stack_guess_master,
          min_stack_custom,
          referRating,
        }
      )
      .then(() => {
        res.json({
          message: "defaults updated successfully",
        } as successResHint);
      })
      .catch((error) => {
        res.status(500).json({
          message: "error found",
          error,
        } as errorResHint);
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error } as errorResHint);
  }
});

defaultRouter.get("/", async (req: Request, res: Response) => {
  try {
    await defaultModel
      .findOne({})
      .then((result) => {
        res.json({
          message: "content found",
          default: result,
        } as successResHint & { default: typeof result });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error } as errorResHint);
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error } as errorResHint);
  }
});

export default defaultRouter;
