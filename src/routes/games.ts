import { Router, Response, Request } from "express";
import { verify } from "jsonwebtoken";
import GameModel, { GameDocType, Games, GameType } from "../model/games";
import users from "../model/users";
import moment from "moment";
import WalletModel from "../model/walltet";
import RecordModel from "../model/gamerecord";
import { config as envConfig } from "dotenv";
import PlayerModel, { playerType } from "../model/player";
import CashWalletModel from "../model/cash_wallet";
import UserPlay, { GameRec } from "../model/plays";
import AdminModel from "../model/admin";
import defaultModel from "../model/default";
import { successResHint, errorResHint } from "./default";
import { cloneDeep, filter, isEmpty } from "lodash";
import roomModel from "../model/rooms";
import AdminCashModel from "../model/admin_model";

envConfig();
const GamesRouter: Router = Router();

export enum RoshamboOption {
  rock,
  paper,
  scissors,
}

export enum PayType {
  cash,
  coin,
}

export interface roshamboHint {
  price_in_cash: number;
  gameInPut: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
    round5: number;
  };
}

export interface matcherHint {
  price_in_cash: number;
  gameInPut: number;
}

export enum choices {
  at_stated_timed,
  immediately,
}

export function FindWinnerOnPenalty(
  p1: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
    round5: number;
  },
  p2: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
    round5: number;
  }
) {
  let count = 0;
  p1.round1 === p2.round1 ? count++ : count--;
  p1.round2 === p2.round2 ? count++ : count--;
  p1.round3 === p2.round3 ? count++ : count--;
  p1.round4 === p2.round4 ? count++ : count--;
  p1.round5 === p2.round5 ? count++ : count--;
  return count >= 3;
}

export function AdminCash (commission_value_in: "$"|"c"|"%", commission_value: number, adminCurrentCash: number, game_price: number, memberCount: number, cashRating: number ) {
  return  commission_value_in === "$"
    ? adminCurrentCash + (commission_value * 2)
    : commission_value_in === "c"
    ? adminCurrentCash +
      ((cashRating * commission_value) * 2)
    : commission_value_in === "%"
    ? adminCurrentCash +
      (game_price / commission_value)
    : adminCurrentCash 
}

export function FindWinnerOnRoshambo(
  p1: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
    round5: number;
  },
  p2: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
    round5: number;
  }
): number {
  let count = 0;
  (p1.round1 === RoshamboOption.rock &&
    p2.round1 === RoshamboOption.scissors) ||
  (p1.round1 === RoshamboOption.paper &&
    p2.round1 === RoshamboOption.scissors) ||
  (p1.round1 === RoshamboOption.scissors && p2.round1 === RoshamboOption.paper)
    ? count++
    : count;
  (p1.round2 === RoshamboOption.rock &&
    p2.round2 === RoshamboOption.scissors) ||
  (p1.round2 === RoshamboOption.paper &&
    p2.round2 === RoshamboOption.scissors) ||
  (p1.round2 === RoshamboOption.scissors && p2.round2 === RoshamboOption.paper)
    ? count++
    : count;
  (p1.round3 === RoshamboOption.rock &&
    p2.round3 === RoshamboOption.scissors) ||
  (p1.round3 === RoshamboOption.paper &&
    p2.round3 === RoshamboOption.scissors) ||
  (p1.round3 === RoshamboOption.scissors && p2.round3 === RoshamboOption.paper)
    ? count++
    : count;
  (p1.round4 === RoshamboOption.rock &&
    p2.round4 === RoshamboOption.scissors) ||
  (p1.round4 === RoshamboOption.paper &&
    p2.round4 === RoshamboOption.scissors) ||
  (p1.round4 === RoshamboOption.scissors && p2.round4 === RoshamboOption.paper)
    ? count++
    : count;
  (p1.round5 === RoshamboOption.rock &&
    p2.round5 === RoshamboOption.scissors) ||
  (p1.round5 === RoshamboOption.paper &&
    p2.round5 === RoshamboOption.scissors) ||
  (p1.round5 === RoshamboOption.scissors && p2.round5 === RoshamboOption.paper)
    ? count++
    : count;
  return count;
}

export function FindWinnerOnMatcher(p1: number, p2: number) {
  return p1 === p2;
}

export function MarkRoshamboGame(
  p1: RoshamboOption,
  p2: RoshamboOption
): GameRec {
  let marked =
    p1 === RoshamboOption.scissors && p2 === RoshamboOption.rock
      ? GameRec.win
      : p1 === RoshamboOption.rock && p2 === RoshamboOption.paper
      ? GameRec.win
      : p1 === RoshamboOption.paper && p2 === RoshamboOption.scissors
      ? GameRec.win
      : p1 === p2
      ? GameRec.draw
      : GameRec.lose;
  return marked;
}

export function shuffle(array: string[]): string[] {
  return array.sort(() => Math.random() - 0.5);
}

GamesRouter.post("/spin", async (req: Request, res: Response) => {
  try {
    const { price_in_coin }: GameType = req.body;
    let auth: string = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let foundRecord: any = await RecordModel.findOne({
      userID: decoded.id,
      date_mark: {
        $gte: new Date(moment().format("YYYY-MM-DD")),
      },
    });
    let wallet: any = await WalletModel.findOne({ userID: decoded.id });
    await new GameModel({
      members: [decoded.id],
      price_in_coin,
      price_in_value: price_in_coin,
      gameDetail: "A game of glory spin",
      gameID: Games.glory_spin,
      played: true,
    })
      .save()
      .then(async () => {
        Promise.all([
          await WalletModel.updateOne(
            { userID: decoded.id },
            { currentCoin: price_in_coin + wallet.currentCoin }
          ).then(async (result: GameType) => {
            if (foundRecord) {
              await RecordModel.updateOne(
                { userID: decoded.id },
                {
                  game_count: foundRecord.game_count + 1,
                  winings: foundRecord.winings + 1,
                  earnings: foundRecord.earnings + price_in_coin,
                }
              );
            } else {
              await new RecordModel({
                userID: decoded.id,
                game_count: 1,
                winings: 1,
                earnings: price_in_coin,
              }).save();
            }
          }),
        ])
          .then(() => {
            res.json({ message: "successful" });
          })
          .catch((error) => {
            res.status(500).json({ message: "error found", error });
          });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.get("/spin/check-time", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await GameModel.findOne({
      members: [decoded.id],
      gameID: Games.glory_spin,
      date: { $gte: new Date(moment().format("YYYY-MM-DD")) },
    }).then((result: GameType) => {
      if (!result) {
        res.json({
          message: "content found",
          spin_details: {
            currentTime: new Date(),
            gameTime: new Date(),
            isPlayable: true,
          },
        });
      } else {
        res.json({
          message: "content found",
          spin_details: {
            currentTime: new Date(),
            gameTime: moment(result.date).add("23", "h"),
            isPlayable: false,
          },
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.get("/search", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    const { price, game }: any = req.query;
    await GameModel.findOne({
      members: { $not: { $eq: decoded.id } },
      played: false,
      price_in_coin: parseInt(price, 10),
      gameID: parseInt(game, 10),
    })
      .then(async (result: GameType) => {
        await PlayerModel.findOne({ userID: result.members[0] }).then(
          (result2: playerType) => {
            res.json({
              message: "content found",
              games: {
                id: result._id,
                profilepic: result2.playerpic,
                playername: result2.playername,
                priceType: result.priceType,
                price_in_coin: result.price_in_coin,
                price_in_value: result.price_in_value,
                date: result.date,
              },
            });
          }
        );
      })
      .catch((error) => {
        res.status(404).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.get("/getter", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    const { min, max, game }: any = req.query;
    await GameModel.find({
      members: { $not: { $eq: decoded.id } },
      played: false,
      gameID: parseInt(game, 10),
      price_in_value: {
        $lte: parseInt(max, 10) !== 0 ? parseInt(max, 10) : 10000000000000,
        $gte: parseInt(min, 10),
      },
    })
      .sort({ date: -1 })
      .limit(15)
      .then(async (result: GameType[]) => {
        let r = []
        result.map((resl)=>{
          r.push({
            _id: resl._id,
            gameMemberCount: resl.gameMemberCount,
            members:resl.members,
            priceType: resl.priceType,
            price_in_value: resl.price_in_value,
            gameType: resl.gameType,
            price_in_coin: resl.price_in_coin,
            gameDetail: resl.gameDetail,
            gameID: resl.gameID,
            played: resl.played,
            date: resl.date,
            playCount: resl.playCount,
            isComplete: resl.isComplete
          })
        })
        // console.log(r)
        res.json({ games: r });
      })
      .catch((error) => {
        res.status(404).json({ message: "error found", error });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.post("/play", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization;
    const {
      gameID,
      playWith,
    }: { gameID: string; playWith: PayType } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: any = verify(token, process.env.SECRET);
    let found = await users.findById(decoded.id);
    let game_ = await GameModel.findById(gameID);
    let coin_wallet = await WalletModel.findOne({ userID: decoded.id });
    let cash_wallet = await CashWalletModel.findOne({ userID: decoded.id });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (playWith === PayType.cash) {
      if (cash_wallet.currentCash < game_.price_in_value) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
      await GameModel.findOneAndUpdate(
        { _id: gameID },
        { 
          played: true,
          members: [game_.members[0], decoded.id],
        } 
      )
        .then(async (gameRec) => {
          CashWalletModel.updateOne(
            { userID: decoded.id }, 
            { currentCash: cash_wallet.currentCash - game_.price_in_value }
          )
            .then(() => {
              res.json({ message: "play", price: game_.price_in_value });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    } else if (playWith === PayType.coin) {
      if (game_.price_in_coin > coin_wallet.currentCoin) {
        res.status(401).json({
          message: "error found",
          error: "insufficient fund in your coin account",
        });
        return;
      }
      await GameModel.findOneAndUpdate(
        { _id: gameID },
        {
          played: true,
          members: [game_.members[0], decoded.id],
        }
      )
        .then(async (gameRec) => {
          await WalletModel.updateOne(
            { userID: decoded.id },
            { currentCoin: coin_wallet.currentCoin - game_.price_in_coin }
          )
            .then(() => {
              res.json({ message: "play", price: game_.price_in_coin
             });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.post("/roshambo", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      price_in_cash,
      gameInPut,
      payWith,
    }: roshamboHint & { payWith: PayType } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let {currentCash} = await CashWalletModel.findOne({ userID: decoded.id });
    let { currentCoin } = await WalletModel.findOne({ userID: decoded.id });
    let { cashRating } = await defaultModel.findOne({});
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let isExiting = await GameModel.findOne({
      played: false,
      price_in_value: price_in_cash,
      gameID: Games.roshambo,
    });
    if (payWith === PayType.cash) {
      if (currentCash < price_in_cash) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    }
    if (payWith === PayType.coin) {
      if (currentCoin < price_in_cash * cashRating) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    }
    if (isExiting) {
      res
        .status(404)
        .json({ message: "is Exiting", id: isExiting._id, isExiting: true });
      return;
    }
    await new GameModel({
      gameMemberCount: 2,
      members: [decoded.id],
      priceType: "virtual",
      price_in_coin: price_in_cash * cashRating ?? 0,
      price_in_value: price_in_cash,
      gameDetail: "A roshamo (i.e rock, paper, scriossor) game for two.",
      gameID: Games.roshambo,
      battleScore: { player1: gameInPut },
    })
      .save()
      .then(async (result) => {
        if (payWith === PayType.cash) {
          await CashWalletModel.updateOne(
            { userID: decoded.id },
            {
              currentCash: currentCash - result.price_in_value,
            }
          )
            .then(() => {
              res.json({ message: "successful", game: result });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
          return;
        }
        if (payWith === PayType.coin) {
          await WalletModel.updateOne(
            { userID: decoded.id },
            {
              currentCoin: currentCoin - result.price_in_coin,
            }
          )
            .then(() => {
              res.json({ message: "successful", game: result });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
          return;
        }
        res.status(404);
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/penalty", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      price_in_cash,
      gameInPut,
      payWith,
    }: roshamboHint & { payWith: PayType } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let {currentCash} = await CashWalletModel.findOne({ userID: decoded.id });
    let { currentCoin } = await WalletModel.findOne({ userID: decoded.id });
    let {cashRating} = await defaultModel.findOne({})
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let isExiting = await GameModel.findOne({
      played: false,
      price_in_value: price_in_cash,
      gameID: Games.penalth_card,
    });
    if (payWith === PayType.cash) {
      if (currentCash < price_in_cash) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    }
    if (payWith === PayType.coin) {
      if (currentCoin < price_in_cash * cashRating) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    }
    if (isExiting) {
      res.status(404).json({
        message: "is Exiting",
        id: isExiting._id,
        isExiting: true,
      });
      return;
    }
    await new GameModel({
      gameMemberCount: 2,
      members: [decoded.id],
      priceType: "virtual",
      price_in_coin: price_in_cash * cashRating ?? 0,
      price_in_value: price_in_cash,
      gameDetail: "A penalt card game for two.",
      gameID: Games.penalth_card,
      battleScore: { player1: gameInPut },
    })
      .save()
      .then(async (result) => {
        if (payWith === PayType.cash) {
          await CashWalletModel.updateOne(
            { userID: decoded.id },
            {
              currentCash: currentCash - result.price_in_value,
            }
          )
            .then(() => {
              res.json({ message: "successful", game: result });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
          return;
        }
        if (payWith === PayType.coin) {
          await WalletModel.updateOne(
            { userID: decoded.id },
            {
              currentCoin: currentCoin - result.price_in_coin,
            }
          )
            .then(() => {
              res.json({ message: "successful", game: result });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
          return;
        }
        res.status(400);
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/guess-master", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      price_in_cash,
      gameInPut,
      payWith,
    }: matcherHint & { payWith: PayType } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let {currentCash} = await CashWalletModel.findOne({ userID: decoded.id });
    let { currentCoin } = await WalletModel.findOne({ userID: decoded.id });
    let { cashRating } = await defaultModel.findOne({});
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (payWith === PayType.cash) {
      if (currentCash < price_in_cash) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    }
    if (payWith === PayType.coin) {
      if (currentCoin < price_in_cash * cashRating) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    }
    let isExiting = await GameModel.findOne({
      played: false,
      price_in_value: price_in_cash,
      gameID: Games.matcher,
    });
    if (isExiting) {
      res.status(404).json({
        message: "is Exiting",
        id: isExiting._id,
        isExiting: true,
      });
      return;
    }
    await new GameModel({
      gameMemberCount: 2,
      members: [decoded.id],
      priceType: "virtual",
      price_in_coin: price_in_cash * cashRating ?? 0,
      price_in_value: price_in_cash,
      gameDetail: "A game of guess.",
      gameID: Games.matcher,
      battleScore: { player1: gameInPut },
    })
      .save()
      .then(async (result) => {
        if (payWith === PayType.cash) {
          await CashWalletModel.updateOne(
            { userID: decoded.id },
            {
              currentCash: currentCash - result.price_in_value,
            }
          )
            .then(() => {
              res.json({ message: "successful", game: result });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
          return;
        }
        if (payWith === PayType.coin) {
          await WalletModel.updateOne(
            { userID: decoded.id },
            {
              currentCoin: currentCoin - result.price_in_coin,
            }
          )
            .then(() => {
              res.json({ message: "successful", game: result });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
          return;
        }
        res.status(400);
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.get("/check", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({
        message: "not allowed",
        error: "invalid auth",
      } as errorResHint);
      return;
    }
    let token = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({
        message: "not allowed",
        error: "invalid token",
      } as errorResHint);
      return;
    }
    let decoded = (verify(token, process.env.SECRET ?? "") as unknown) as {
      id: string;
    };
    let user = await users.findById(decoded.id);
    if (!user) {
      res.status(406).json({
        message: "not allowed",
        error: "user not found",
      } as errorResHint);
      return;
    }
    const { price, gameID } = (req.query as unknown) as {
      price: string;
      gameID: string;
    };
    let isExiting = await GameModel.findOne({
      played: false,
      price_in_value: parseInt(price, 10),
      gameID: parseInt(gameID, 10),
    });
    res.json({
      message: "is Exiting",
      gamer_: isExiting
        ? {
            _id: isExiting._id,
            gameMemberCount: isExiting.gameMemberCount,
            members: isExiting.members,
            priceType: isExiting.priceType,
            price_in_coin: isExiting.price_in_coin,
            price_in_value: isExiting.price_in_value,
            gameType: isExiting.gameType,
            gameDetail: isExiting.gameDetail,
            gameID: isExiting.gameID,
            played: isExiting.played,
            date: isExiting.date,
            playCount: isExiting.playCount,
          }
        : null,
      isExiting: Boolean(isExiting),
    });
  } catch (error) {
    res.status(500).json({ message: "error found", error } as errorResHint);
  }
});

GamesRouter.post("/penalty/challange", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      id,
      gameInPut,
    }: {
      id: string;
      gameInPut: {
        round1: number;
        round2: number;
        round3: number;
        round4: number;
        round5: number;
      };
    } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_penalty } = await defaultModel.findOne({});
    let { currentCash } = await CashWalletModel.findOne({
      userID: decoded.id,
    });
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = await CashWalletModel.findOne({
      userID: game_.members[0],
    });
    let { currentCash: AdminCurrentCash } = await AdminCashModel.findOne({})
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let winner = FindWinnerOnPenalty(game_.battleScore.player1, gameInPut);
    if (winner) {
      await AdminCashModel.updateOne(
        {},
        {currentCash: AdminCash(commission_penalty.value_in, commission_penalty.value, AdminCurrentCash, game_.price_in_value, 2, cashRating)
          })
         
      await new RecordModel({
        userID: decoded.id,
        game: Games.penalth_card,
        won: "yes",
        earnings:
          commission_penalty.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_penalty.value)
            : commission_penalty.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_penalty.value)
            : commission_penalty.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_penalty.value)
            : p1Cash,
      }).save();
      await new RecordModel({
        userID: game_.members[0],
        game: Games.penalth_card,
        won: "no",
        earnings: -(commission_penalty.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_penalty.value)
          : commission_penalty.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_penalty.value)
          : commission_penalty.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_penalty.value)
          : p1Cash),
      }).save();
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash:
            commission_penalty.value_in === "$"
              ? currentCash +
                game_.price_in_value +
                (game_.price_in_value - commission_penalty.value)
              : commission_penalty.value_in === "c"
              ? game_.price_in_value +
                currentCash +
                (game_.price_in_value - cashRating * commission_penalty.value)
              : commission_penalty.value_in === "%"
              ? game_.price_in_value +
                currentCash +
                (game_.price_in_value -
                  game_.price_in_value / commission_penalty.value)
              : currentCash,
        }
      )
        .then(() => {
          res.json({
            message: "you won",
            winner: true,
            price:
              commission_penalty.value_in === "$"
                ? game_.price_in_value +
                  (game_.price_in_value - commission_penalty.value)
                : commission_penalty.value_in === "c"
                ? game_.price_in_value +
                  (game_.price_in_value - cashRating * commission_penalty.value)
                : commission_penalty.value_in === "%"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    game_.price_in_value / commission_penalty.value)
                : p1Cash,
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    } else {
      await new RecordModel({
        userID: decoded.id,
        game: Games.penalth_card,
        won: "no",
        earnings: -(commission_penalty.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_penalty.value)
          : commission_penalty.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_penalty.value)
          : commission_penalty.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_penalty.value)
          : p1Cash),
      }).save();
      await new RecordModel({
        userID: game_.members[0],
        game: Games.penalth_card,
        won: "yes",
        earnings:
          commission_penalty.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_penalty.value)
            : commission_penalty.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_penalty.value)
            : commission_penalty.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_penalty.value)
            : p1Cash,
      }).save();
      await CashWalletModel.updateOne(
        { userID: game_.members[0] },
        {
          p1Cash:
            commission_penalty.value_in === "$"
              ? p1Cash +
                game_.price_in_value +
                (game_.price_in_value - commission_penalty.value)
              : commission_penalty.value_in === "c"
              ? game_.price_in_value +
                p1Cash +
                (game_.price_in_value - cashRating * commission_penalty.value)
              : commission_penalty.value_in === "%"
              ? game_.price_in_value +
                p1Cash +
                (game_.price_in_value -
                  game_.price_in_value / commission_penalty.value)
              : p1Cash,
        }
      )
        .then(() => {
          res.json({
            message: "you lost",
            winner: false,
            price: 0,
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    }
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/roshambo/challange", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      id,
      gameInPut,
    }: {
      id: string;
      gameInPut: {
        round1: number;
        round2: number;
        round3: number;
        round4: number;
        round5: number;
      };
    } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_roshambo } = await defaultModel.findOne({});
    let { currentCash } = await CashWalletModel.findOne({
      userID: decoded.id,
    });
    
    console.log(currentCash)
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = await CashWalletModel.findOne({
      userID: game_.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let winner = FindWinnerOnRoshambo(game_.battleScore.player1, gameInPut);
    if (winner) {
      await new RecordModel({
        userID: decoded.id,
        game: Games.roshambo,
        won: "yes",
        earnings:
          commission_roshambo.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_roshambo.value)
            : commission_roshambo.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_roshambo.value)
            : commission_roshambo.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_roshambo.value)
            : p1Cash,
      }).save();
      await new RecordModel({
        userID: game_.members[0],
        game: Games.roshambo,
        won: "no",
        earnings: -(commission_roshambo.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_roshambo.value)
          : commission_roshambo.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_roshambo.value)
          : commission_roshambo.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_roshambo.value)
          : p1Cash),
      }).save();
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash:
            commission_roshambo.value_in === "$"
              ? currentCash +
                game_.price_in_value +
                (game_.price_in_value - commission_roshambo.value)
              : commission_roshambo.value_in === "c"
              ? game_.price_in_value +
                currentCash +
                (game_.price_in_value - cashRating * commission_roshambo.value)
              : commission_roshambo.value_in === "%"
              ? game_.price_in_value +
                currentCash +
                (game_.price_in_value -
                  game_.price_in_value / commission_roshambo.value)
              : currentCash,
        }
      )
        .then(() => {
          res.json({
            message: "you won",
            winner: true,
            price:
              commission_roshambo.value_in === "$"
                ? game_.price_in_value +
                  (game_.price_in_value - commission_roshambo.value)
                : commission_roshambo.value_in === "c"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    cashRating * commission_roshambo.value)
                : commission_roshambo.value_in === "%"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    game_.price_in_value / commission_roshambo.value)
                : p1Cash,
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    } else {
      await new RecordModel({
        userID: game_.members[0],
        game: Games.roshambo,
        won: "yes",
        earnings:
          commission_roshambo.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_roshambo.value)
            : commission_roshambo.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_roshambo.value)
            : commission_roshambo.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_roshambo.value)
            : p1Cash,
      }).save();
      await new RecordModel({
        userID: decoded.id,
        game: Games.roshambo,
        won: "no",
        earnings: -(commission_roshambo.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_roshambo.value)
          : commission_roshambo.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_roshambo.value)
          : commission_roshambo.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_roshambo.value)
          : p1Cash),
      }).save();
      await CashWalletModel.updateOne(
        { userID: game_.members[0] },
        {
          p1Cash:
            commission_roshambo.value_in === "$"
              ? p1Cash +
                game_.price_in_value +
                (game_.price_in_value - commission_roshambo.value)
              : commission_roshambo.value_in === "c"
              ? game_.price_in_value +
                p1Cash +
                (game_.price_in_value - cashRating * commission_roshambo.value)
              : commission_roshambo.value_in === "%"
              ? game_.price_in_value +
                p1Cash +
                (game_.price_in_value -
                  game_.price_in_value / commission_roshambo.value)
              : p1Cash,
        }
      )
        .then(() => {
          res.json({
            message: "you lost",
            winner: false,
            price: 0,
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    }
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/matcher/challange", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      id,
      gameInPut,
    }: {
      id: string;
      gameInPut: number;
    } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_guess_mater } = await defaultModel.findOne(
      {}
    );
    let { currentCash } = await CashWalletModel.findOne({
      userID: decoded.id,
    });
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = await CashWalletModel.findOne({
      userID: game_.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let winner = FindWinnerOnMatcher(game_.battleScore.player1, gameInPut);
    if (winner) {
      await new RecordModel({
        userID: game_.members[0],
        game: Games.matcher,
        won: "yes",
        earnings:
          commission_guess_mater.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_guess_mater.value)
            : commission_guess_mater.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_guess_mater.value)
            : commission_guess_mater.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_guess_mater.value)
            : p1Cash,
      }).save();
      await new RecordModel({
        userID: decoded.id,
        game: Games.matcher,
        won: "no",
        earnings: -(commission_guess_mater.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_guess_mater.value)
          : commission_guess_mater.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_guess_mater.value)
          : commission_guess_mater.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_guess_mater.value)
          : p1Cash),
      }).save();
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash:
            commission_guess_mater.value_in === "$"
              ? currentCash +
                game_.price_in_value +
                (game_.price_in_value - commission_guess_mater.value)
              : commission_guess_mater.value_in === "c"
              ? game_.price_in_value +
                currentCash +
                (game_.price_in_value -
                  cashRating * commission_guess_mater.value)
              : commission_guess_mater.value_in === "%"
              ? game_.price_in_value +
                currentCash +
                (game_.price_in_value -
                  game_.price_in_value / commission_guess_mater.value)
              : currentCash,
        }
      )
        .then(() => {
          res.json({
            message: "you won",
            winner: true,
            price:
              commission_guess_mater.value_in === "$"
                ? game_.price_in_value +
                  (game_.price_in_value - commission_guess_mater.value)
                : commission_guess_mater.value_in === "c"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    cashRating * commission_guess_mater.value)
                : commission_guess_mater.value_in === "%"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    game_.price_in_value / commission_guess_mater.value)
                : p1Cash,
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    } else {
      await new UserPlay({
        player2ID: decoded.id,
        isWin: false,
        gameID: id,
      }).save();
      let count = await UserPlay.countDocuments({
        player2ID: decoded.id,
        gameID: id,
      });
      if (count >= 3) {
        await new RecordModel({
          userID: game_.members[0],
          game: Games.matcher,
          won: "yes",
          earnings:
            commission_guess_mater.value_in === "$"
              ? game_.price_in_value +
                (game_.price_in_value - commission_guess_mater.value)
              : commission_guess_mater.value_in === "c"
              ? game_.price_in_value +
                (game_.price_in_value -
                  cashRating * commission_guess_mater.value)
              : commission_guess_mater.value_in === "%"
              ? game_.price_in_value +
                (game_.price_in_value -
                  game_.price_in_value / commission_guess_mater.value)
              : p1Cash,
        }).save();
        await new RecordModel({
          userID: decoded.id,
          game: Games.matcher,
          won: "no",
          earnings: -(commission_guess_mater.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_guess_mater.value)
            : commission_guess_mater.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_guess_mater.value)
            : commission_guess_mater.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_guess_mater.value)
            : p1Cash),
        }).save();
        await CashWalletModel.updateOne(
          { userID: game_.members[0] },
          {
            p1Cash:
              commission_guess_mater.value_in === "$"
                ? p1Cash +
                  game_.price_in_value +
                  (game_.price_in_value - commission_guess_mater.value)
                : commission_guess_mater.value_in === "c"
                ? game_.price_in_value +
                  p1Cash +
                  (game_.price_in_value -
                    cashRating * commission_guess_mater.value)
                : commission_guess_mater.value_in === "%"
                ? game_.price_in_value +
                  p1Cash +
                  (game_.price_in_value -
                    game_.price_in_value / commission_guess_mater.value)
                : p1Cash,
          }
        )
          .then(() => {
            res.json({
              message: "you lost",
              winner: false,
              price: 0,
            });
          })
          .catch((error) => {
            res.status(500).json({ message: "error found", error });
          });
      } else {
        res.json({ count: 4 - count, winner: false, price: 0 });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.get("/mine", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let roomgames = await roomModel.find({ players: [decoded.id]})
    await GameModel.find({ played: false, members: [decoded.id] })
      .sort({ date: -1 })
      .limit(45)
      .then((result) => {
        let games = [];
        roomgames.map(g => {
          games.push({
            date: g.date,
            gameDetail: g.room_name,
            gameID: Games.rooms,
            gameMemberCount: g.activeMember,
            gameType: "Rooms",
            members: g.players,
            playCount: 0,
            price_in_coin: g.key_time,
            price_in_value: g.entry_price,
            _id: g._id,
          })
        })
        result.map((rels) => {
          games.push({
            date: rels.date,
            gameDetail: rels.gameDetail,
            gameID: rels.gameID,
            gameMemberCount: rels.gameMemberCount,
            gameType: rels.gameType,
            members: rels.members,
            playCount: rels.playCount,
            price_in_coin: rels.price_in_coin,
            price_in_value: rels.price_in_value,
            _id: rels._id,
          });
        });
        res.json({ message: "content found", games });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post(
  "/roshambo/challange/one-on-one",
  async (req: Request, res: Response) => {
    try {
      let auth = req.headers.authorization;
      let {
        id,
        gameInPut,
        round,
        payWith
      }: {
        id: string;
        gameInPut: RoshamboOption;
          round: number;
        payWith: PayType
      } = req.body;
      if (!auth) {
        res.status(406).json({ message: "error found", error: "invalid auth" });
        return;
      }
      let token: string = auth.replace("Bearer ", "");
      if (!token || token === "") {
        res.status(406).json({ message: "error found", error: "empty token" });
        return;
      }
      let decoded = (verify(token, process.env.SECRET) as unknown) as {
        id: string;
      };
      let found = await users.findById(decoded.id);
      if (!found) {
        res.status(419).json({
          message: "error found",
          error: "invalid user",
        } as errorResHint);
        return;
      }
      let { commission_roshambo, cashRating } = await defaultModel.findOne({});
      let game_ = await GameModel.findById(id);
      let { currentCoin } = await WalletModel.findOne({
        userID: decoded.id,
      });
      let { currentCash } = await CashWalletModel.findOne({
        userID: decoded.id,
      });
      
      if (!game_) {
        res.status(401).json({
          message: "error found",
          error: "invalid game",
        } as errorResHint);
        return;
      }
      let { currentCash: currentCashP2 } = await CashWalletModel.findOne({
        userID: game_?.members[0] ?? "",
      });

      // with coin
      if (payWith === PayType.coin) {
        if (game_.price_in_coin > currentCoin) {
          res
            .status(401)
            .json({ message: "error found", error: "insufficient fund" });
          return;
        }
      } else {
        // with cash
        if (game_.price_in_value > currentCash) {
          res
            .status(401)
            .json({ message: "error found", error: "insufficient fund" });
          return;
        }
      }

      await new UserPlay({
        player2ID: decoded.id,
        isWin: MarkRoshamboGame(
          game_.battleScore.player1[`round${round}`],
          gameInPut
        ),
        gameID: id,
      }).save();
      let played = await UserPlay.countDocuments({
        player2ID: decoded.id,
        gameID: id,
      });
      let winCount = await UserPlay.countDocuments({
        player2ID: decoded.id,
        gameID: id,
        isWin: GameRec.win,
      });
      let loseCount = await UserPlay.countDocuments({
        player2ID: decoded.id,
        gameID: id,
        isWin: GameRec.lose,
      });
      let drawCount = await UserPlay.countDocuments({
        player2ID: decoded.id,
        gameID: id,
        isWin: GameRec.draw,
      });
      if ((drawCount >= 5)) {
        await new RecordModel({
          userID: game_.members[0],
          game: Games.roshambo,
          won: "draw",
          earnings: -(commission_roshambo.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_roshambo.value)
            : commission_roshambo.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_roshambo.value)
            : commission_roshambo.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_roshambo.value)
            : 0),
        }).save();
        await new RecordModel({
          userID: decoded.id,
          game: Games.roshambo,
          won: "draw",
          earnings: -(commission_roshambo.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_roshambo.value)
            : commission_roshambo.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_roshambo.value)
            : commission_roshambo.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_roshambo.value)
            : 0),
        }).save();
        
        await CashWalletModel.updateOne(
          { userID: decoded.id },
          {
            currentCash:
              currentCash + (commission_roshambo.value_in === "$"
                ?
                  (game_.price_in_value - commission_roshambo.value)
                : commission_roshambo.value_in === "c"
                ? 
                  (game_.price_in_value - cashRating * commission_roshambo.value)
                : commission_roshambo.value_in === "%"
                ?
                  (game_.price_in_value -
                    game_.price_in_value / commission_roshambo.value)
                : 0)
          }
        );
        await CashWalletModel.updateOne(
          { userID: game_.members[0] },
          {
            currentCash:
              currentCashP2 + (commission_roshambo.value_in === "$"
                ?
                  (game_.price_in_value - commission_roshambo.value)
                : commission_roshambo.value_in === "c"
                ? 
                  (game_.price_in_value - cashRating * commission_roshambo.value)
                : commission_roshambo.value_in === "%"
                ?
                  (game_.price_in_value -
                    game_.price_in_value / commission_roshambo.value)
                : 0)
          }
        );
        res.json({
          winner: MarkRoshamboGame(
            game_.battleScore.player1[`round${round}`],
            gameInPut
          ),
          price:
            commission_roshambo.value_in === "$"
              ? game_.price_in_value +
                (game_.price_in_value - commission_roshambo.value)
              : commission_roshambo.value_in === "c"
              ? game_.price_in_value +
                (game_.price_in_value - cashRating * commission_roshambo.value)
              : commission_roshambo.value_in === "%"
              ? game_.price_in_value +
                (game_.price_in_value -
                  game_.price_in_value / commission_roshambo.value)
              : 0,
          final: "draw",
          finalWin: true,
        });
        return
      }
      else if (winCount >= 3 || (drawCount >=4 && winCount >=1) || (drawCount >=3 && winCount >=2) ) {
        await new RecordModel({
          userID: game_.members[0],
          game: Games.roshambo,
          won: "no",
          earnings: -(commission_roshambo.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_roshambo.value)
            : commission_roshambo.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_roshambo.value)
            : commission_roshambo.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_roshambo.value)
            : 0),
        }).save();
        await new RecordModel({
          userID: decoded.id,
          game: Games.roshambo,
          won: "yes",
          earnings:
            commission_roshambo.value_in === "$"
              ? game_.price_in_value +
                (game_.price_in_value - commission_roshambo.value)
              : commission_roshambo.value_in === "c"
              ? game_.price_in_value +
                (game_.price_in_value - cashRating * commission_roshambo.value)
              : commission_roshambo.value_in === "%"
              ? game_.price_in_value +
                (game_.price_in_value -
                  game_.price_in_value / commission_roshambo.value)
              : 0,
        }).save();
        await CashWalletModel.updateOne(
          { userID: decoded.id },
          {
            currentCash:
              currentCash + (commission_roshambo.value_in === "$"
                ? game_.price_in_value +
                  (game_.price_in_value - commission_roshambo.value)
                : commission_roshambo.value_in === "c"
                ? game_.price_in_value +
                  (game_.price_in_value - cashRating * commission_roshambo.value)
                : commission_roshambo.value_in === "%"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    game_.price_in_value / commission_roshambo.value)
                : 0),
          }
        );
        res.json({
          winner: MarkRoshamboGame(game_.battleScore.player1[`round${round}`],gameInPut),
          price:
            commission_roshambo.value_in === "$"
              ? game_.price_in_value +
                (game_.price_in_value - commission_roshambo.value)
              : commission_roshambo.value_in === "c"
              ? game_.price_in_value +
                (game_.price_in_value - cashRating * commission_roshambo.value)
              : commission_roshambo.value_in === "%"
              ? game_.price_in_value +
                (game_.price_in_value -
                  game_.price_in_value / commission_roshambo.value)
              : 0,
          final: "won",
          finalWin: true,
        });
        return;
      } else if (loseCount >= 3 || (drawCount >=4 && loseCount >=1) || (drawCount >=3 && loseCount >=2)) {
        await new RecordModel({
          userID: decoded.id,
          game: Games.roshambo,
          won: "no",
          earnings: -(commission_roshambo.value_in === "$"
            ? game_.price_in_value +
              (game_.price_in_value - commission_roshambo.value)
            : commission_roshambo.value_in === "c"
            ? game_.price_in_value +
              (game_.price_in_value - cashRating * commission_roshambo.value)
            : commission_roshambo.value_in === "%"
            ? game_.price_in_value +
              (game_.price_in_value -
                game_.price_in_value / commission_roshambo.value)
            : 0),
        }).save();
        await new RecordModel({
          userID: game_.members[0],
          game: Games.roshambo,
          won: "yes",
          earnings:
            commission_roshambo.value_in === "$"
              ? game_.price_in_value +
                (game_.price_in_value - commission_roshambo.value)
              : commission_roshambo.value_in === "c"
              ? game_.price_in_value +
                (game_.price_in_value - cashRating * commission_roshambo.value)
              : commission_roshambo.value_in === "%"
              ? game_.price_in_value +
                (game_.price_in_value -
                  game_.price_in_value / commission_roshambo.value)
              : 0,
        }).save();
        await CashWalletModel.updateOne(
          { userID: game_.members[0] },
          {
            currentCash:
              currentCashP2 + (commission_roshambo.value_in === "$"
                ? game_.price_in_value +
                  (game_.price_in_value - commission_roshambo.value)
                : commission_roshambo.value_in === "c"
                ? game_.price_in_value +
                  (game_.price_in_value - cashRating * commission_roshambo.value)
                : commission_roshambo.value_in === "%"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    game_.price_in_value / commission_roshambo.value)
                : 0),
          }
        );
        res.json({
          winner: MarkRoshamboGame(
          game_.battleScore.player1[`round${round}`],
          gameInPut
        ),
          price: 0,
          final: "lost",
          finalWin: false,
        });
        return;
      } else {
        res.json({
          winner: MarkRoshamboGame(
          game_.battleScore.player1[`round${round}`],
          gameInPut
        ),
          price: 0,
          final: "no"
        });
      }
    } catch (error) {
      res.status(500).json({ message: "error found", error });
      console.error(error);
    }
  }
);

GamesRouter.post(
  "/penalty/challange/one-on-one",
  async (req: Request, res: Response) => {
    try {
      let auth = req.headers.authorization;
      let {
        id,
        gameInPut,
        round,
        payWith
      }: {
        id: string;
        gameInPut: number;
          round: number;
        payWith: PayType
      } = req.body;
      if (!auth) {
        res.status(406).json({ message: "error found", error: "invalid auth" });
        return;
      }
      let token: string = auth.replace("Bearer ", "");
      if (!token || token === "") {
        res.status(406).json({ message: "error found", error: "empty token" });
        return;
      }
      let decoded = (verify(token, process.env.SECRET) as unknown) as {
        id: string;
      };
      let found = await users.findById(decoded.id);
      let {currentCoin} = await WalletModel.findOne({userID: decoded.id})
      let { currentCash } = await CashWalletModel.findOne({
        userID: decoded.id,
      });
      console.log(currentCash)
      let game_ = await GameModel.findById(id);
      if (!found) {
        res.status(406).json({ message: "error found", error: "invalid user" });
        return;
      }
      let { commission_penalty, cashRating } = await defaultModel.findOne({});

      // with coin
      if (payWith === PayType.coin) {
        if (game_.price_in_coin > currentCoin) {
          res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
          return;
        }
      } else {
        // with cash
        if (game_.price_in_value > currentCash) {
          res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
          return;
        }
      }
      await GameModel.findOne({ _id: id })
        .then(async (result) => {
          let { currentCash: currentCashP2 } = await CashWalletModel.findOne({
            userID: game_.members[0],
          });
          await new UserPlay({
            player2ID: decoded.id,
            isWin: result.battleScore.player1[`round${round}`] === gameInPut,
            gameID: result._id,
          }).save();

          let winCount = await UserPlay.countDocuments({
            player2ID: decoded.id,
            gameID: id,
            isWin: true,
          });
          let loseCount = await UserPlay.countDocuments({
            player2ID: decoded.id,
            gameID: id,
            isWin: false,
          });
          if (winCount >= 3) {
            await new RecordModel({
              userID: game_.members[0],
              game: Games.penalth_card,
              won: "no",
              earnings: -(commission_penalty.value_in === "$"
                ? game_.price_in_value +
                  (game_.price_in_value - commission_penalty.value)
                : commission_penalty.value_in === "c"
                ? game_.price_in_value +
                  (game_.price_in_value - cashRating * commission_penalty.value)
                : commission_penalty.value_in === "%"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    game_.price_in_value / commission_penalty.value)
                : 0),
            }).save();
            await new RecordModel({
              userID: decoded.id,
              game: Games.penalth_card,
              won: "yes",
              earnings:
                commission_penalty.value_in === "$"
                  ? game_.price_in_value +
                    (game_.price_in_value - commission_penalty.value)
                  : commission_penalty.value_in === "c"
                  ? game_.price_in_value +
                    (game_.price_in_value -
                      cashRating * commission_penalty.value)
                  : commission_penalty.value_in === "%"
                  ? game_.price_in_value +
                    (game_.price_in_value -
                      game_.price_in_value / commission_penalty.value)
                  : 0,
            }).save();
            await CashWalletModel.updateOne(
              { userID: decoded.id },
              {
                currentCash:
                  currentCash + (commission_penalty.value_in === "$"
                    ? game_.price_in_value +
                      (game_.price_in_value - commission_penalty.value)
                    : commission_penalty.value_in === "c"
                    ? game_.price_in_value +
                      (game_.price_in_value -
                        cashRating * commission_penalty.value)
                    : commission_penalty.value_in === "%"
                    ? game_.price_in_value +
                      (game_.price_in_value -
                        game_.price_in_value / commission_penalty.value)
                    : 0),
              }
            );
            res.json({
              winner: game_.battleScore.player1[`round${round}`] === gameInPut,
              price:
                commission_penalty.value_in === "$"
                  ? game_.price_in_value +
                    (game_.price_in_value - commission_penalty.value)
                  : commission_penalty.value_in === "c"
                  ? game_.price_in_value +
                    (game_.price_in_value -
                      cashRating * commission_penalty.value)
                  : commission_penalty.value_in === "%"
                  ? game_.price_in_value +
                    (game_.price_in_value -
                      game_.price_in_value / commission_penalty.value)
                  : 0,
              final: true,
              finalWin: true,
            });
            return;
          } else if (loseCount >= 3) {
            await new RecordModel({
              userID: decoded.id,
              game: Games.penalth_card,
              won: "no",
              earnings: -(commission_penalty.value_in === "$"
                ? game_.price_in_value +
                  (game_.price_in_value - commission_penalty.value)
                : commission_penalty.value_in === "c"
                ? game_.price_in_value +
                  (game_.price_in_value - cashRating * commission_penalty.value)
                : commission_penalty.value_in === "%"
                ? game_.price_in_value +
                  (game_.price_in_value -
                    game_.price_in_value / commission_penalty.value)
                : 0),
            }).save();
            await new RecordModel({
              userID: game_.members[0],
              game: Games.penalth_card,
              won: "yes",
              earnings:
                commission_penalty.value_in === "$"
                  ? game_.price_in_value +
                    (game_.price_in_value - commission_penalty.value)
                  : commission_penalty.value_in === "c"
                  ? game_.price_in_value +
                    (game_.price_in_value -
                      cashRating * commission_penalty.value)
                  : commission_penalty.value_in === "%"
                  ? game_.price_in_value +
                    (game_.price_in_value -
                      game_.price_in_value / commission_penalty.value)
                  : 0,
            }).save();
            await CashWalletModel.updateOne(
              { userID: game_.members[0] },
              {
                currentCash:
                  currentCashP2 + (commission_penalty.value_in === "$"
                    ? game_.price_in_value +
                      (game_.price_in_value - commission_penalty.value)
                    : commission_penalty.value_in === "c"
                    ? game_.price_in_value +
                      (game_.price_in_value -
                        cashRating * commission_penalty.value)
                    : commission_penalty.value_in === "%"
                    ? game_.price_in_value +
                      (game_.price_in_value -
                        game_.price_in_value / commission_penalty.value)
                    : 0),
              }
            );
            res.json({
              winner: game_.battleScore.player1[`round${round}`] === gameInPut,
              price: 0,
              final: true,
              finalWin: false,
            });
            return;
          } else {
            res.json({
              winner: game_.battleScore.player1[`round${round}`] === gameInPut,
              price: 0,
              final: false,
            });
          }
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    } catch (error) {
      res.status(500).json({ message: "error found", error });
      console.error(error);
    }
  }
);

GamesRouter.post("/lucky-geoge", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth || auth === "") {
      res.status(403).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(401).json({ message: "error found", error: "invalid token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET ?? "") as unknown) as {
      adminID: string;
    };
    let admin = await AdminModel.findById(decoded.adminID);
    if (!admin) {
      res
        .status(419)
        .json({ message: "error found", error: "Admin not found" });
      return;
    }
    const {cashRating} = await defaultModel.findOne({})
    const {
      title,
      description,
      memberCount,
      price,
      winnerPrice,
      winnerCount,
    }: {
      title: string;
      description: string;
      memberCount: number;
      price: number;
      winnerPrice: number,
      winnerCount: number;
    } = req.body;
    await new GameModel({
      gameMemberCount: memberCount,
      members: [],
      priceType: "virtual",
      price_in_coin: price* cashRating??0,
      price_in_value: price,
      gameDetail: "Lucky geoge.",
      gameID: Games.lucky_geoge,
      battleScore: { player1: { title, description, winnerCount, winnerPrice } },
    })
      .save()
      .then((result) => {
        res.json({ message: "successful", game: result });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.get("/lucky-geoge", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth || auth === "") {
      res.status(403).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(401).json({ message: "error found", error: "invalid token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET ?? "") as unknown) as {
      id: string;
      adminID?: string
    };
    let user = await users.findById(decoded.id);
    let admin = await AdminModel.findById(decoded?.adminID);
    if(admin){
      await GameModel.find({gameID: Games.lucky_geoge, played: false}).then((games) => {
       res.json({games})
     }).catch((error) => {
       res.status(500).json({ message: "error found", error });
     })
     return;
    } else if (user) {
      let { currentCash } = await CashWalletModel.findOne({ userID: decoded.id });
      let { currentCoin } = await WalletModel.findOne({ userID: decoded.id });
      let allG = await GameModel.find({gameID: Games.lucky_geoge, played: false})
      await GameModel.find({ gameID: Games.lucky_geoge, members: { $not: { $eq: decoded.id } }, played: false, $or: [{ price_in_value: { $lte: currentCash } }, { price_in_coin: { $lte: currentCoin } }] }).then((games) => {
        res.json(admin? {games: allG} : {games})
      }).catch((error) => {
        res.status(500).json({ message: "error found", error });
      })
      return;
    }else {
      res.status(419).json({ message: "error found", error: "User not found" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "error found", error });
  }
})

GamesRouter.post("/lucky-geoge/play", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth || auth === "") {
      res.status(403).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(401).json({ message: "error found", error: "invalid token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET ?? "") as unknown) as {
      id: string;
    };
    let user = await users.findById(decoded.id);
    if (!user) {
      res.status(419).json({ message: "error found", error: "User not found" });
      return;
    }
    let { currentCash } = await CashWalletModel.findOne({ userID: decoded.id });
    let { currentCoin } = await WalletModel.findOne({ userID: decoded.id });
    const {
      id,
      payWith,
    }: {
      id: string;
      payWith: PayType;
    } = req.body;
    let { price_in_coin: stack, price_in_value } = await GameModel.findById(id);
    const { cashRating } = await defaultModel.findOne({});
    if (payWith === PayType.cash) {
      if (price_in_value > currentCash) {
        res
          .status(402)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        { currentCash: currentCash - stack * 2 }
      );
    } else {
      if (stack > currentCoin) {
        res
          .status(402)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
      await WalletModel.updateOne(
        { userID: decoded.id },
        { currentCoin: currentCoin - stack }
      );
    }
    await GameModel.findOneAndUpdate(
      { _id: id },
      {
        $push: { members: decoded.id },
      }
    )
      .then(async (result) => {
        res.json({ message: "successful", price: result.price_in_value });
        if (result.members.length >= result.gameMemberCount) {
          let winners = shuffle(result.members).slice(
            0,
            result.battleScore.player1.winnerCount
          );
          for (let member in result.members) {
            if (!winners.includes(member)) {
              await RecordModel.updateOne(
                {
                  userID: member,
                },
                {
                  won: "no",
                  earnings: 0,
                  date_mark: new Date(),
                }
              );
            }
          }
          for (let winner in winners) {
            let { currentCash } = await CashWalletModel.findById(winner);

            await RecordModel.updateOne(
              {
                userID: winner,
              },
              {
                won: "yes",
                earnings: result.battleScore.player1.winnerPrice,
                date_mark: new Date(),
              }
            );
            await CashWalletModel.updateOne(
              { _id: winner },
              { currentCash: (currentCash ?? 0) + result.battleScore.player1.winnerPrice }
            );
          }
          await GameModel.updateOne({ _id: id }, { played: true}).then(()=>{}).catch(console.error)
        }
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.post("/penalty/exit", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      id,
    }: {
      id: string;
    } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_penalty } = await defaultModel.findOne({});
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = await CashWalletModel.findOne({
      userID: game_.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await new RecordModel({
      userID: decoded.id,
      game: Games.penalth_card,
      won: "no",
      earnings: 0,
    }).save();
    await new RecordModel({
      userID: game_.members[0],
      game: Games.penalth_card,
      won: "yes",
      earnings:
        commission_penalty.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_penalty.value)
          : commission_penalty.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_penalty.value)
          : commission_penalty.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_penalty.value)
          : p1Cash,
    }).save();
    await CashWalletModel.updateOne(
      { userID: game_.members[0] },
      {
        p1Cash:
          commission_penalty.value_in === "$"
            ? p1Cash +
              game_.price_in_value +
              (game_.price_in_value - commission_penalty.value)
            : commission_penalty.value_in === "c"
            ? game_.price_in_value +
              p1Cash +
              (game_.price_in_value - cashRating * commission_penalty.value)
            : commission_penalty.value_in === "%"
            ? game_.price_in_value +
              p1Cash +
              (game_.price_in_value -
                game_.price_in_value / commission_penalty.value)
            : p1Cash,
      }
    )
      .then(() => {
        res.json({
          message: "game exit",
        });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/roshambo/exit", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      id,
    }: {
      id: string;
    } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_roshambo } = await defaultModel.findOne({});
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = await CashWalletModel.findOne({
      userID: game_.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await new RecordModel({
      userID: game_.members[0],
      game: Games.roshambo,
      won: "yes",
      earnings:
        commission_roshambo.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_roshambo.value)
          : commission_roshambo.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_roshambo.value)
          : commission_roshambo.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_roshambo.value)
          : p1Cash,
    }).save();
    await new RecordModel({
      userID: decoded.id,
      game: Games.roshambo,
      won: "no",
      earnings: 0,
    }).save();
    await CashWalletModel.updateOne(
      { userID: game_.members[0] },
      {
        p1Cash:
          commission_roshambo.value_in === "$"
            ? p1Cash +
              game_.price_in_value +
              (game_.price_in_value - commission_roshambo.value)
            : commission_roshambo.value_in === "c"
            ? game_.price_in_value +
              p1Cash +
              (game_.price_in_value - cashRating * commission_roshambo.value)
            : commission_roshambo.value_in === "%"
            ? game_.price_in_value +
              p1Cash +
              (game_.price_in_value -
                game_.price_in_value / commission_roshambo.value)
            : p1Cash,
      }
    )
      .then(() => {
        res.json({
          message: "game exit",
        });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/matcher/exit", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      id,
    }: {
      id: string;
    } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_guess_mater } = await defaultModel.findOne(
      {}
    );
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = await CashWalletModel.findOne({
      userID: game_.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await new RecordModel({
      userID: game_.members[0],
      game: Games.roshambo,
      won: "yes",
      earnings:
        commission_guess_mater.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_guess_mater.value)
          : commission_guess_mater.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_guess_mater.value)
          : commission_guess_mater.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_guess_mater.value)
          : p1Cash,
    }).save();
    await new RecordModel({
      userID: decoded.id,
      game: Games.roshambo,
      won: "no",
      earnings:
        commission_guess_mater.value_in === "$"
          ? game_.price_in_value +
            (game_.price_in_value - commission_guess_mater.value)
          : commission_guess_mater.value_in === "c"
          ? game_.price_in_value +
            (game_.price_in_value - cashRating * commission_guess_mater.value)
          : commission_guess_mater.value_in === "%"
          ? game_.price_in_value +
            (game_.price_in_value -
              game_.price_in_value / commission_guess_mater.value)
          : p1Cash,
    }).save();
    await CashWalletModel.updateOne(
      { userID: game_.members[0] },
      {
        p1Cash:
          commission_guess_mater.value_in === "$"
            ? p1Cash +
              game_.price_in_value +
              (game_.price_in_value - commission_guess_mater.value)
            : commission_guess_mater.value_in === "c"
            ? game_.price_in_value +
              p1Cash +
              (game_.price_in_value - cashRating * commission_guess_mater.value)
            : commission_guess_mater.value_in === "%"
            ? game_.price_in_value +
              p1Cash +
              (game_.price_in_value -
                game_.price_in_value / commission_guess_mater.value)
            : p1Cash,
      }
    )
      .then(() => {
        res.json({
          message: "game exit",
        });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/custom-game", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({
        message: "error found",
        error: "user no found",
      } as errorResHint);
      return;
    }
    const { cashRating } = await defaultModel.findOne({});
    const { currentCash } = await CashWalletModel.findOne({
      userID: decoded.id,
    });

    const {
      player2Username,
      price_in_value,
      gameID,
      title,
      description,
      answer,
      endDate,
      endGameTime,
      choice,
    }: GameDocType & {
      player2Username: string;
      endDate: Date;
      title: string;
      description: string;
      answer: string;
      endGameTime: Date;
      choice: choices;
    } = req.body;
    if (currentCash < price_in_value) {
      res
        .status(402)
        .json({ message: "error found", error: "insuficient found" });
      return;
    }
    const p2 = await PlayerModel.findOne({ playername: player2Username.toLowerCase() });
    if (player2Username !== "") {
      if (!p2) { 
        res
        .status(409)
        .json({ message: "error found", error: "player 2 not found" });
        return;
      }
    }
    await new GameModel({
      gameMemberCount: 2,
      members: [decoded.id, p2?.userID?? null],
      price_in_coin: cashRating * price_in_value,
      price_in_value,
      gameDetail: "A game created between friends",
      gameID: Games.custom_game,
      played: false,
      battleScore: {
        player1: {
          endDate,
          title,
          description,
          answer,
          endGameTime,
          choice,
        },
      },
      playCount: 0,
    })
      .save()
      .then(async (result) => {
        await CashWalletModel.updateOne(
          { userID: decoded.id },
          { currentCash: currentCash - result.price_in_value }
        );
        res.json({ message: "successful", game: result });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.get(
  "/custom-game/challange",
  async (req: Request, res: Response) => {
    try {
      let auth = req.headers.authorization;
      if (!auth) {
        res.status(406).json({ message: "error found", error: "invalid auth" });
        return;
      }
      let token: string = auth.replace("Bearer ", "");
      if (!token || token === "") {
        res.status(406).json({ message: "error found", error: "empty token" });
        return;
      }
      let decoded = (verify(token, process.env.SECRET) as unknown) as {
        id: string;
      };
      let found = await users.findById(decoded.id);
      if (!found) {
        res.status(406).json({
          message: "error found",
          error: "user no found",
        } as errorResHint);
        return;
      }
      const { gameID, payWith, answer } = (req.query as unknown) as {
        gameID: string;
        payWith: string;
        answer: string;
      };
      const paywith: PayType = parseInt(payWith, 10);
      const { currentCash } = await CashWalletModel.findOne({
        userID: decoded.id,
      });
      const { currentCoin } = await WalletModel.findOne({ userID: decoded.id });
      const {
        price_in_value,
        price_in_coin,
        battleScore,
      } = await GameModel.findById(gameID);
      if (paywith === PayType.cash) {
        if (price_in_value > currentCash) {
          res.status(402).json({
            message: "error found",
            error: "insufficient fund",
          } as errorResHint);
          return;
        }
        await CashWalletModel.updateOne(
          { userID: decoded.id },
          { currentCash: currentCash - price_in_value }
        );
        await GameModel.updateOne(
          { _id: gameID },
          {
            played: true,
            date: new Date(),
            battleScore: { player1: battleScore.player1, player2: { answer } },
          }
        )
          .then(() => {
            res.json({ message: "successful" } as successResHint);
          })
          .catch((error) => {
            res
              .status(400)
              .json({ message: "error found", error } as errorResHint);
          });
      }
      if (paywith === PayType.coin) {
        if (price_in_coin > currentCoin) {
          res.status(402).json({
            message: "error found",
            error: "insufficient fund",
          } as errorResHint);
          return;
        }
        await WalletModel.updateOne(
          { userID: decoded.id },
          { currentCoin: currentCoin - price_in_coin }
        );
        await GameModel.updateOne(
          { _id: gameID },
          {
            played: true,
            date: new Date(),
            battleScore: { player1: battleScore.player1, player2: { answer } },
          }
        )
          .then(() => {
            res.json({ message: "successful" } as successResHint);
          })
          .catch((error) => {
            res
              .status(400)
              .json({ message: "error found", error } as errorResHint);
          });
      }
    } catch (error) {
      res.status(500).json({ message: "error found", error });
      console.error(error);
    }
  }
);

GamesRouter.post("/custom-game/exit", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    let {
      id,
    }: {
      id: string;
    } = req.body;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_custom_game } = await defaultModel.findOne(
      {}
    );
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = await CashWalletModel.findOne({
      userID: game_.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await GameModel.updateOne({ _id: id }, { played: true });
    await new RecordModel({
      userID: game_.members[0],
      game: Games.custom_game,
      won: "rejected",
      earnings: game_.price_in_value,
    }).save();
    await CashWalletModel.updateOne(
      { userID: game_.members[0] },
      {
        p1Cash:
          commission_custom_game.value_in === "$"
            ? p1Cash +
              game_.price_in_value +
              (game_.price_in_value - commission_custom_game.value)
            : commission_custom_game.value_in === "c"
            ? game_.price_in_value +
              p1Cash +
              (game_.price_in_value - cashRating * commission_custom_game.value)
            : commission_custom_game.value_in === "%"
            ? game_.price_in_value +
              p1Cash +
              (game_.price_in_value -
                game_.price_in_value / commission_custom_game.value)
            : p1Cash,
      }
    )
      .then(() => {
        res.json({
          message: "game exit",
        });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.get("/requests", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(419).json({
        message: "error found",
        error: "user no found",
      } as errorResHint);
      return;
    }
    await GameModel.find({
      played: false,
      gameID: Games.custom_game,
    })
      .sort({ date: -1 })
      .then((result) => {
        let clone = cloneDeep(result)
        let data = filter(clone, (_game_) => {
         return _game_.members[1] === decoded.id
        })
        res.json({ message: "content found", requests: data });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.get("/custom-game/games", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, process.env.SECRET) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(419).json({
        message: "error found",
        error: "user no found",
      } as errorResHint);
      return;
    }
    await GameModel.find({
      played: false,
      gameID: Games.custom_game,
    })
      .sort({ date: -1 })
      .then((requests) => {
        let clone = cloneDeep(requests);
        let data = filter(clone, (_game_) => {
          return _game_.members[1] === null;
        });
        res.json({ message: "content found", requests: data });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

export default GamesRouter;
