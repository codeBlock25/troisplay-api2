import { Router, Response, Request } from "express";
import { verify } from "jsonwebtoken";
import GameModel, { GameDocType, Games, GameType } from "../model/games";
import users from "../model/users";
import moment from "moment";
import WalletModel from "../model/walltet";
import RecordModel from "../model/gamerecord";
import { config as envConfig } from "dotenv";
import PlayerModel from "../model/player";
import CashWalletModel from "../model/cash_wallet";
import UserPlay, { GameRec } from "../model/plays";
import AdminModel from "../model/admin";
import defaultModel from "../model/default";
import { successResHint, errorResHint } from "./default";
import roomModel from "../model/rooms";
import AdminCashModel from "../model/admin_model";
import { RoshamboOption, choices, PayType } from "../types/enum";
import { roshamboHint, matcherHint } from "../types/interface";
import {
  FindWinnerOnRoshambo,
  MarkRoshamboGame,
  FindWinnerOnPenalty,
  FindWinnerOnMatcher,
  shuffle,
  PlayerCash,
  PlayAdmin,
  PlayerDrawCash,
  PlayerCashLeft,
  PlayerCoinLeft,
} from "../function";
import { generate as randGenerate } from "randomstring";
import { concat, filter, isEmpty, sortBy } from "lodash";

envConfig();
const GamesRouter: Router = Router();

const secret: string = process.env.SECRET ?? "";

GamesRouter.delete("/any/cancel", async (req: Request, res: Response) => {
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
    const { gameID } = (req.query as unknown) as { gameID: string };
    const game = await GameModel.findOne({ _id: gameID });
    const defaults = await defaultModel.findOne();
    const adminCash = await AdminCashModel.findOne({});
    const cash = await CashWalletModel.findOne({ userID: decoded.id });
    if (game) {
      let commission: { value: number; value_in: "c" | "$" | "%" } =
        game.gameID === Games.roshambo
          ? defaults?.commission_roshambo ?? { value: 20, value_in: "%" }
          : game.gameID === Games.penalth_card
          ? defaults?.commission_penalty ?? { value: 20, value_in: "%" }
          : game.gameID === Games.matcher
          ? defaults?.commission_guess_mater ?? { value: 20, value_in: "%" }
          : game.gameID === Games.custom_game
          ? defaults?.commission_custom_game ?? { value: 20, value_in: "%" }
          : { value: 20, value_in: "%" };
      PlayAdmin(
        commission,
        game.price_in_value,
        adminCash?.currentCash ?? 10,
        defaults?.cashRating ?? 10,
        1
      );
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCashLeft(
            commission,
            cash?.currentCash ?? 100,
            game.price_in_value,
            1,
            defaults?.cashRating ?? 10
          ),
        }
      );
      await GameModel.deleteOne({ _id: gameID })
        .then(() => {
          res.json({ message: "games cancel." });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
          console.error(error);
        });
    } else {
      res.status(400).json({ message: "This game does not exit." });
    }
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/spin", async (req: Request, res: Response) => {
  try {
    const { price_in_coin }: GameType = req.body;
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
          ).then(async (_) => {
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
    await GameModel.findOne({
      members: [decoded.id],
      gameID: Games.glory_spin,
      date: { $gte: new Date(moment().format("YYYY-MM-DD")) },
    }).then((result) => {
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
    const { price, game }: any = req.query;
    await GameModel.findOne({
      members: { $not: { $eq: decoded.id } },
      played: false,
      price_in_coin: parseInt(price, 10),
      gameID: parseInt(game, 10),
    })
      .then(async (result) => {
        await PlayerModel.findOne({ userID: result?.members[0] }).then(
          (result2) => {
            res.json({
              message: "content found",
              games: {
                id: result?._id,
                profilepic: result2?.playerpic,
                playername: result2?.playername,
                priceType: result?.priceType,
                price_in_coin: result?.price_in_coin,
                price_in_value: result?.price_in_value,
                date: result?.date,
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
    const { min, max, game }: any = req.query;
    if (
      game === Games.roshambo ||
      game === Games.penalth_card ||
      game === Games.matcher
    ) {
      await GameModel.find({
        members: { $not: { $eq: decoded.id } },
        played: false,
        gameID: parseInt(game, 10),
        price_in_value: max,
      })
        .sort({ date: -1 })
        .limit(15)
        .then(async (result: GameType[]) => {
          let r: any[] = [];
          result.map((resl) => {
            if (resl.gameID === Games.custom_game) {
              r.push(resl);
            } else {
              r.push({
                _id: resl._id,
                gameMemberCount: resl.gameMemberCount,
                members: resl.members,
                priceType: resl.priceType,
                price_in_value: resl.price_in_value,
                gameType: resl.gameType,
                price_in_coin: resl.price_in_coin,
                gameDetail: resl.gameDetail,
                gameID: resl.gameID,
                played: resl.played,
                date: resl.date,
                playCount: resl.playCount,
                isComplete: resl.isComplete,
              });
            }
          });
          // console.log(r)
          res.json({ games: r });
        })
        .catch((error) => {
          res.status(404).json({ message: "error found", error });
        });
    } else {
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
          let r: any[] = [];
          result.map((resl) => {
            if (resl.gameID === Games.custom_game) {
              r.push(resl);
            } else {
              r.push({
                _id: resl._id,
                gameMemberCount: resl.gameMemberCount,
                members: resl.members,
                priceType: resl.priceType,
                price_in_value: resl.price_in_value,
                gameType: resl.gameType,
                price_in_coin: resl.price_in_coin,
                gameDetail: resl.gameDetail,
                gameID: resl.gameID,
                played: resl.played,
                date: resl.date,
                playCount: resl.playCount,
                isComplete: resl.isComplete,
              });
            }
          });
          // console.log(r)
          res.json({ games: r });
        })
        .catch((error) => {
          res.status(404).json({ message: "error found", error });
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.post("/play", async (req: Request, res: Response) => {
  try {
    let auth: string = req.headers.authorization ?? "";
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
    let decoded: any = verify(token, secret);
    let found = await users.findById(decoded.id);
    let game_ = await GameModel.findById(gameID);
    let coin_wallet = await WalletModel.findOne({ userID: decoded.id });
    let cash_wallet = await CashWalletModel.findOne({ userID: decoded.id });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (playWith === PayType.cash) {
      if ((cash_wallet?.currentCash ?? 0) < (game_?.price_in_value ?? 0)) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
      await GameModel.findOneAndUpdate(
        { _id: gameID },
        {
          played: true,
          members: [game_?.members[0], decoded.id],
        }
      )
        .then(async (_) => {
          CashWalletModel.updateOne(
            { userID: decoded.id },
            {
              currentCash:
                (cash_wallet?.currentCash ?? 0) - (game_?.price_in_value ?? 0),
            }
          )
            .then(() => {
              res.json({ message: "play", price: game_?.price_in_value });
            })
            .catch((error) => {
              res.status(500).json({ message: "error found", error });
            });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    } else if (playWith === PayType.coin) {
      if ((game_?.price_in_coin ?? 0) > (coin_wallet?.currentCoin ?? 0)) {
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
          members: [game_?.members[0], decoded.id],
        }
      )
        .then(async (_) => {
          await WalletModel.updateOne(
            { userID: decoded.id },
            {
              currentCoin:
                (coin_wallet?.currentCoin ?? 0) - (game_?.price_in_coin ?? 0),
            }
          )
            .then(() => {
              res.json({
                message: "play",
                price: game_?.price_in_coin,
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
    let auth = req.headers.authorization ?? "";
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
    let coinInstance = await WalletModel.findOne({ userID: decoded.id });
    let defaultInstance = await defaultModel.findOne({});
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (!coinInstance || !cashInstance || !defaultInstance) {
      res.status(500).json({ error: "internal error", message: "error found" });
      return;
    }
    const { currentCash } = cashInstance;
    const { currentCoin } = coinInstance;
    const { cashRating } = defaultInstance;
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
      if (isExiting.members[0] !== decoded.id) {
        res
          .status(404)
          .json({ message: "is Exiting", id: isExiting._id, isExiting: true });
        return;
      }
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
    let auth = req.headers.authorization ?? "";
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
    let coinInstance = await WalletModel.findOne({ userID: decoded.id });
    let defaultInstance = await defaultModel.findOne({});
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (!coinInstance || !cashInstance || !defaultInstance) {
      res.status(500).json({ error: "internal error", message: "error found" });
      return;
    }
    const { currentCash } = cashInstance;
    const { currentCoin } = coinInstance;
    const { cashRating } = defaultInstance;
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
      if (isExiting.members[0] !== decoded.id) {
        res
          .status(404)
          .json({ message: "is Exiting", id: isExiting._id, isExiting: true });
        return;
      }
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
    let auth = req.headers.authorization ?? "";
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
    let coinInstance = await WalletModel.findOne({ userID: decoded.id });
    let defaultInstance = await defaultModel.findOne({});
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (!coinInstance || !cashInstance || !defaultInstance) {
      res.status(500).json({ error: "internal error", message: "error found" });
      return;
    }
    const { currentCash } = cashInstance;
    const { currentCoin } = coinInstance;
    const { cashRating } = defaultInstance;
    if (!found) {
      res.status (406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (payWith === PayType.cash) {
      if (price_in_cash > currentCash) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    } else {
      if (price_in_cash * cashRating > currentCoin) {
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
      if (isExiting.members[0] !== decoded.id) {
        res
          .status(404)
          .json({ message: "is Exiting", id: isExiting._id, isExiting: true });
        return;
      }
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
    let auth = req.headers.authorization ?? "";
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
    let auth = req.headers.authorization ?? "";
    let {
      id,
      gameInPut,
      payWith,
    }: {
      id: string;
      gameInPut: {
        round1: number;
        round2: number;
        round3: number;
        round4: number;
        round5: number;
      };
      payWith: PayType;
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let game_ = await GameModel.findById(id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
    let coinInstance = await WalletModel.findOne({ userID: decoded.id });
    let defaultInstance = await defaultModel.findOne({});
    let adminCashInstance = await AdminCashModel.findOne({});
    let p2CashInstance = await CashWalletModel.findOne({
      userID: game_?.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (
      !coinInstance ||
      !cashInstance ||
      !defaultInstance ||
      !p2CashInstance ||
      !adminCashInstance
    ) {
      res.status(500).json({ error: "internal error", message: "error found" });
      return;
    }
    const { currentCash: p1Cash } = cashInstance;
    const { currentCoin } = coinInstance;
    const { currentCash: p2Cash } = p2CashInstance;
    const { currentCash: AdminCurrentCash } = adminCashInstance;
    const { cashRating, commission_penalty } = defaultInstance;
    let winner = FindWinnerOnPenalty(game_?.battleScore.player1, gameInPut)
      ? GameRec.lose
      : GameRec.win;
    if (payWith === PayType.coin) {
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCoinLeft(
            commission_penalty,
            currentCoin,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      );
    } else {
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCashLeft(
            commission_penalty,
            p1Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      );
    }
    if (winner) {
      await new RecordModel({
        userID: decoded.id,
        game: Games.penalth_card,
        won: "yes",
        earnings: PlayerCash(
          commission_penalty,
          p1Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await new RecordModel({
        userID: game_?.members[0],
        game: Games.penalth_card,
        won: "no",
        earnings: -PlayerCash(
          commission_penalty,
          p2Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCash(
            commission_penalty,
            p1Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      )
        .then(() => {
          res.json({
            message: "you won",
            winner: GameRec.win,
            battlePlan: game_?.battleScore.player1,
            game_result: {
              round1:
                game_?.battleScore.player1.round1 === gameInPut.round1
                  ? GameRec.win
                  : GameRec.lose,
              round2:
                game_?.battleScore.player1.round2 === gameInPut.round2
                  ? GameRec.win
                  : GameRec.lose,
              round3:
                game_?.battleScore.player1.round3 === gameInPut.round3
                  ? GameRec.win
                  : GameRec.lose,
              round4:
                game_?.battleScore.player1.round4 === gameInPut.round4
                  ? GameRec.win
                  : GameRec.lose,
              round5:
                game_?.battleScore.player1.round5 === gameInPut.round5
                  ? GameRec.win
                  : GameRec.lose,
            },
            price: PlayerCash(
              commission_penalty,
              p1Cash,
              game_?.price_in_value ?? 0,
              1,
              cashRating
            ),
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
        earnings: -PlayerCash(
          commission_penalty,
          p1Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await new RecordModel({
        userID: game_?.members[0],
        game: Games.penalth_card,
        won: "yes",
        earnings: PlayerCash(
          commission_penalty,
          p2Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await CashWalletModel.updateOne(
        { userID: game_?.members[0] },
        {
          p2Cash: PlayerCash(
            commission_penalty,
            p1Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      )
        .then(() => {
          res.json({
            message: "you lost",
            winner: GameRec.lose,
            price: 0,
            battlePlan: game_?.battleScore.player1,
            game_result: {
              round1:
                game_?.battleScore.player1.round1 === gameInPut.round1
                  ? GameRec.win
                  : GameRec.lose,
              round2:
                game_?.battleScore.player1.round2 === gameInPut.round2
                  ? GameRec.win
                  : GameRec.lose,
              round3:
                game_?.battleScore.player1.round3 === gameInPut.round3
                  ? GameRec.win
                  : GameRec.lose,
              round4:
                game_?.battleScore.player1.round4 === gameInPut.round4
                  ? GameRec.win
                  : GameRec.lose,
              round5:
                game_?.battleScore.player1.round5 === gameInPut.round5
                  ? GameRec.win
                  : GameRec.lose,
            },
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    }
    await PlayAdmin(
      commission_penalty,
      game_?.price_in_value ?? 0,
      AdminCurrentCash,
      cashRating,
      2
    );
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/roshambo/challange", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization ?? "";
    let {
      id,
      gameInPut,
      payWith,
    }: {
      id: string;
      gameInPut: {
        round1: number;
        round2: number;
        round3: number;
        round4: number;
        round5: number;
      };
      payWith: PayType;
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let game_ = await GameModel.findById(id);
    let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
    let coinInstance = await WalletModel.findOne({ userID: decoded.id });
    let defaultInstance = await defaultModel.findOne({});
    let adminCashInstance = await AdminCashModel.findOne({});
    let p2CashInstance = await CashWalletModel.findOne({
      userID: game_?.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (
      !coinInstance ||
      !cashInstance ||
      !defaultInstance ||
      !p2CashInstance ||
      !adminCashInstance
    ) {
      res.status(500).json({ error: "internal error", message: "error found" });
      return;
    }
    const { currentCash: p1Cash } = cashInstance;
    const { currentCash: p2Cash } = p2CashInstance;
    const { currentCoin } = coinInstance;
    const { currentCash: AdminCurrentCash } = adminCashInstance;
    const { cashRating, commission_roshambo } = defaultInstance;
    let winner = FindWinnerOnRoshambo(game_?.battleScore.player1, gameInPut);
    if (payWith === PayType.coin) {
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCoinLeft(
            commission_roshambo,
            currentCoin,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      );
    } else {
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCashLeft(
            commission_roshambo,
            p1Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      );
    }
    if (winner === GameRec.win) {
      await new RecordModel({
        userID: decoded.id,
        game: Games.roshambo,
        won: "yes",
        earnings: PlayerCash(
          commission_roshambo,
          p1Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await new RecordModel({
        userID: game_?.members[0],
        game: Games.roshambo,
        won: "no",
        earnings: -PlayerCash(
          commission_roshambo,
          p2Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCash(
            commission_roshambo,
            p1Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      )
        .then(() => {
          res.json({
            message: "you won",
            winner,
            battlePlan: game_?.battleScore.player1,
            game_result: {
              round1: MarkRoshamboGame(
                game_?.battleScore.player1.round1,
                gameInPut.round1
              ),
              round2: MarkRoshamboGame(
                game_?.battleScore.player1.round2,
                gameInPut.round2
              ),
              round3: MarkRoshamboGame(
                game_?.battleScore.player1.round3,
                gameInPut.round3
              ),
              round4: MarkRoshamboGame(
                game_?.battleScore.player1.round4,
                gameInPut.round4
              ),
              round5: MarkRoshamboGame(
                game_?.battleScore.player1.round5,
                gameInPut.round5
              ),
            },
            price: PlayerCash(
              commission_roshambo,
              p1Cash,
              game_?.price_in_value ?? 0,
              1,
              cashRating
            ),
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    } else if (winner === GameRec.draw) {
      await new RecordModel({
        userID: decoded.id,
        game: Games.roshambo,
        won: "yes",
        earnings: PlayerDrawCash(
          commission_roshambo,
          p1Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await new RecordModel({
        userID: game_?.members[0],
        game: Games.roshambo,
        won: "no",
        earnings: -PlayerDrawCash(
          commission_roshambo,
          p2Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await CashWalletModel.updateOne(
        { userID: game_?.members[0] },
        {
          currentCash: PlayerDrawCash(
            commission_roshambo,
            p2Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      );
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerDrawCash(
            commission_roshambo,
            p1Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      )
        .then(() => {
          res.json({
            message: "you drew",
            winner,
            battlePlan: game_?.battleScore.player1,
            game_result: {
              round1: MarkRoshamboGame(
                game_?.battleScore.player1.round1,
                gameInPut.round1
              ),
              round2: MarkRoshamboGame(
                game_?.battleScore.player1.round2,
                gameInPut.round2
              ),
              round3: MarkRoshamboGame(
                game_?.battleScore.player1.round3,
                gameInPut.round3
              ),
              round4: MarkRoshamboGame(
                game_?.battleScore.player1.round4,
                gameInPut.round4
              ),
              round5: MarkRoshamboGame(
                game_?.battleScore.player1.round5,
                gameInPut.round5
              ),
            },
            price: PlayerCash(
              commission_roshambo,
              p1Cash,
              game_?.price_in_value ?? 0,
              1,
              cashRating
            ),
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    } else {
      await new RecordModel({
        userID: game_?.members[0],
        game: Games.roshambo,
        won: "yes",
        earnings: PlayerCash(
          commission_roshambo,
          p2Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await new RecordModel({
        userID: decoded.id,
        game: Games.roshambo,
        won: "no",
        earnings: -PlayerCash(
          commission_roshambo,
          p1Cash,
          game_?.price_in_value ?? 0,
          1,
          cashRating
        ),
      }).save();
      await CashWalletModel.updateOne(
        { userID: game_?.members[0] },
        {
          p1Cash: PlayerCash(
            commission_roshambo,
            p2Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      )
        .then(() => {
          res.json({
            message: "you lost",
            winner,
            battlePlan: game_?.battleScore.player1,
            price: 0,
            game_result: {
              round1: MarkRoshamboGame(
                game_?.battleScore.player1.round1,
                gameInPut.round1
              ),
              round2: MarkRoshamboGame(
                game_?.battleScore.player1.round2,
                gameInPut.round2
              ),
              round3: MarkRoshamboGame(
                game_?.battleScore.player1.round3,
                gameInPut.round3
              ),
              round4: MarkRoshamboGame(
                game_?.battleScore.player1.round4,
                gameInPut.round4
              ),
              round5: MarkRoshamboGame(
                game_?.battleScore.player1.round5,
                gameInPut.round5
              ),
            },
          });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
    }

    await PlayAdmin(
      commission_roshambo,
      game_?.price_in_value ?? 0,
      AdminCurrentCash,
      cashRating,
      2
    );
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/matcher/challange", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization ?? "";
    let {
      id,
      gameInPut,
      payWith,
    }: {
      id: string;
      gameInPut: number;
      payWith: PayType;
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    let game_ = await GameModel.findById(id);
    let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
    let coinInstance = await WalletModel.findOne({ userID: decoded.id });
    let defaultInstance = await defaultModel.findOne({});
    let adminCashInstance = await AdminCashModel.findOne({});
    let p2CashInstance = await CashWalletModel.findOne({
      userID: game_?.members[0],
    });
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    if (
      !coinInstance ||
      !cashInstance ||
      !defaultInstance ||
      !p2CashInstance ||
      !adminCashInstance
    ) {
      res.status(500).json({ error: "internal error", message: "error found" });
      return;
    }
    const { currentCash: p1Cash } = cashInstance;
    const { currentCoin } = coinInstance;
    const { currentCash: p2Cash } = p2CashInstance;
    const { currentCash: AdminCurrentCash } = adminCashInstance;
    const { cashRating, commission_guess_mater } = defaultInstance;
    let winner = FindWinnerOnMatcher(game_?.battleScore.player1, gameInPut);
    let count = await UserPlay.countDocuments({
      player2ID: decoded.id,
      gameID: id,
    });
    if (payWith === PayType.cash) {
      if (p1Cash < (game_?.price_in_value ?? 0)) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    } else {
      if (currentCoin < (game_?.price_in_value ?? 0) * cashRating) {
        res
          .status(401)
          .json({ message: "error found", error: "insufficient fund" });
        return;
      }
    }
    if (payWith === PayType.coin) {
      await WalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCoinLeft(
            commission_guess_mater,
            currentCoin,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      );
    } else {
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        {
          currentCash: PlayerCashLeft(
            commission_guess_mater,
            p1Cash,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }
      );
    }
    if (winner) {
      if (count === 1) {
        await new RecordModel({
          userID: decoded.id,
          game: Games.matcher,
          won: "yes",
          earnings: PlayerCash(
            commission_guess_mater,
            0,
            (game_?.price_in_value ?? 0) * 1,
            2,
            cashRating
          ),
        }).save();
        await new RecordModel({
          userID: game_?.members[0],
          game: Games.matcher,
          won: "no",
          earnings: -PlayerCash(
            commission_guess_mater,
            0,
            (game_?.price_in_value ?? 0)-(game_?.price_in_value ?? 0) * 1,
            2,
            cashRating
          ),
        }).save();
        await CashWalletModel.updateOne(
          { userID: game_?.members[0] },
          {
            currentCash: PlayerCash(
              commission_guess_mater,
              p2Cash,
              (game_?.price_in_value ?? 0) - (game_?.price_in_value ?? 0) * 1,
              2,
              cashRating
            ),
          }
        );
        await CashWalletModel.updateOne(
          { userID: decoded.id },
          {
            currentCash: PlayerCash(
              commission_guess_mater,
              p1Cash,
              (game_?.price_in_value ?? 0) * 1,
              2,
              cashRating
            ),
          }
        )
          .then(() => {
            res.json({
              message: "you won",
              winner: true,
              price: PlayerCash(
                commission_guess_mater,
                0,
                (game_?.price_in_value ?? 0) * 1,
                2,
                cashRating
              ),
            });
          })
          .catch((error) => {
            res.status(500).json({ message: "error found", error });
          });
      } else if (count === 2) {
        await new RecordModel({
          userID: decoded.id,
          game: Games.matcher,
          won: "yes",
          earnings: PlayerCash(
            commission_guess_mater,
            0,
            (game_?.price_in_value ?? 0) * 0.8,
            2,
            cashRating
          ),
        }).save();
        await new RecordModel({
          userID: game_?.members[0],
          game: Games.matcher,
          won: "no",
          earnings: -PlayerCash(
            commission_guess_mater,
            0,
            (game_?.price_in_value ?? 0)-(game_?.price_in_value ?? 0) * 0.8,
            2,
            cashRating
          ),
        }).save();
        await CashWalletModel.updateOne(
          { userID: game_?.members[0] },
          {
            currentCash: PlayerCash(
              commission_guess_mater,
              p2Cash,
              (game_?.price_in_value ?? 0)-(game_?.price_in_value ?? 0) * 0.8,
              2,
              cashRating
            ),
          }
        )
        await CashWalletModel.updateOne(
          { userID: decoded.id },
          {
            currentCash: PlayerCash(
              commission_guess_mater,
              p1Cash,
              (game_?.price_in_value ?? 0) * 0.8,
              2,
              cashRating
            ),
          }
        )
          .then(() => {
            res.json({
              message: "you won",
              winner: true,
              price: PlayerCash(
                commission_guess_mater,
                0,
                (game_?.price_in_value ?? 0) * 0.8,
                2,
                cashRating
              ),
            });
          })
          .catch((error) => {
            res.status(500).json({ message: "error found", error });
          });
      } else {
        await new RecordModel({
          userID: decoded.id,
          game: Games.matcher,
          won: "yes",
          earnings: PlayerCash(
            commission_guess_mater,
            0,
            (game_?.price_in_value ?? 0) * 0.6,
            2,
            cashRating
          ),
        }).save();
        await new RecordModel({
          userID: game_?.members[0],
          game: Games.matcher,
          won: "no",
          earnings: -PlayerCash(
            commission_guess_mater,
            0,
            (game_?.price_in_value ?? 0) * 0.6,
            2,
            cashRating
          ),
        }).save();
        await CashWalletModel.updateOne(
          { userID: game_?.members[0] },
          {
            currentCash: PlayerCash(
              commission_guess_mater,
              p2Cash,
              (game_?.price_in_value ?? 0)-(game_?.price_in_value ?? 0) * 0.6,
              2,
              cashRating
            ),
          }
        )
        await CashWalletModel.updateOne(
          { userID: decoded.id },
          {
            currentCash: PlayerCash(
              commission_guess_mater,
              p1Cash,
              (game_?.price_in_value ?? 0) * 0.6,
              2,
              cashRating
            ),
          }
        )
          .then(() => {
            res.json({
              message: "you won",
              winner: true,
              price: PlayerCash(
                commission_guess_mater,
                0,
                (game_?.price_in_value ?? 0) * 0.6,
                2,
                cashRating
              ),
            });
          })
          .catch((error) => {
            res.status(500).json({ message: "error found", error });
          });
      }
    } else {
      await new UserPlay({
        player2ID: decoded.id,
        isWin: false,
        gameID: id,
      }).save();
      if (count >= 3) {
        await new RecordModel({
          userID: game_?.members[0],
          game: Games.matcher,
          won: "yes",
          earnings: PlayerCash(
            commission_guess_mater,
            0,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }).save();
        await new RecordModel({
          userID: decoded.id,
          game: Games.matcher,
          won: "no",
          earnings: -PlayerCash(
            commission_guess_mater,
            0,
            game_?.price_in_value ?? 0,
            1,
            cashRating
          ),
        }).save();
        await CashWalletModel.updateOne(
          { userID: game_?.members[0] },
          {
            currentCash: PlayerCash(
              commission_guess_mater,
              p2Cash,
              game_?.price_in_value ?? 0,
              2,
              cashRating
            ),
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
    await GameModel.updateOne(
      {
        _id: game_?._id ?? "",
      },
      {
        played: true,
      }
    );
    await PlayAdmin(
      commission_guess_mater,
      game_?.price_in_value ?? 0,
      AdminCurrentCash,
      cashRating,
      2
    );
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.get("/mine", async (req: Request, res: Response) => {
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
    let roomgames = await roomModel.find({ players: [decoded.id] });
    let customgames = await GameModel.find({
      members: decoded.id,
      gameID: Games.custom_game,
      isComplete: false,
      played: true,
    });
    await GameModel.find({
      played: false,
      gameID: { $not: { $eq: Games.custom_game } },
      members: decoded.id,
    })
      .sort({ date: -1 })
      .limit(45)
      .then((result) => {
        let games: any[] = [];
        roomgames.map((g) => {
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
          });
        });
        let allGames = concat(result, customgames);
        allGames.map((rels) => {
          if (rels.gameID === Games.custom_game) {
            games.push(rels);
          } else {
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
          }
        });
        res.json({
          message: "content found",
          games: sortBy(games, { date: 1 }),
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

GamesRouter.post(
  "/roshambo/challange/one-on-one",
  async (req: Request, res: Response) => {
    try {
      let auth = req.headers.authorization ?? "";
      let {
        id,
        gameInPut,
        round,
        payWith,
      }: {
        id: string;
        gameInPut: RoshamboOption;
        round: number;
        payWith: PayType;
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
      let decoded = (verify(token, secret) as unknown) as {
        id: string;
      };
      let found = await users.findById(decoded.id);
      let game_ = await GameModel.findById(id);
      let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
      let coinInstance = await WalletModel.findOne({ userID: decoded.id });
      let defaultInstance = await defaultModel.findOne({});
      let adminCashInstance = await AdminCashModel.findOne({});
      let p2CashInstance = await CashWalletModel.findOne({
        userID: game_?.members[0],
      });
      if (!found) {
        res.status(406).json({ message: "error found", error: "invalid user" });
        return;
      }
      if (
        !coinInstance ||
        !cashInstance ||
        !defaultInstance ||
        !p2CashInstance ||
        !adminCashInstance
      ) {
        res
          .status(500)
          .json({ error: "internal error", message: "error found" });
        return;
      }
      if (!game_) {
        res.status(401).json({
          message: "error found",
          error: "invalid game",
        } as errorResHint);
        return;
      }
      const { currentCash: p1Cash } = cashInstance;
      const { currentCoin } = coinInstance;
      const { currentCash: p2Cash } = p2CashInstance;
      //  const { currentCash: AdminCurrentCash } = adminCashInstance;
      const { cashRating, commission_roshambo } = defaultInstance;
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
        if (game_.price_in_value > p1Cash) {
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
      // let played = await UserPlay.countDocuments({
      //   player2ID: decoded.id,
      //   gameID: id,
      // });
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
      if (drawCount >= 5) {
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
              p1Cash +
              (commission_roshambo.value_in === "$"
                ? game_.price_in_value - commission_roshambo.value
                : commission_roshambo.value_in === "c"
                ? game_.price_in_value - cashRating * commission_roshambo.value
                : commission_roshambo.value_in === "%"
                ? game_.price_in_value -
                  game_.price_in_value / commission_roshambo.value
                : 0),
          }
        );
        await CashWalletModel.updateOne(
          { userID: game_.members[0] },
          {
            currentCash:
              p2Cash +
              (commission_roshambo.value_in === "$"
                ? game_.price_in_value - commission_roshambo.value
                : commission_roshambo.value_in === "c"
                ? game_.price_in_value - cashRating * commission_roshambo.value
                : commission_roshambo.value_in === "%"
                ? game_.price_in_value -
                  game_.price_in_value / commission_roshambo.value
                : 0),
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
        return;
      } else if (
        winCount >= 3 ||
        (drawCount >= 4 && winCount >= 1) ||
        (drawCount >= 3 && winCount >= 2)
      ) {
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
              p1Cash +
              (commission_roshambo.value_in === "$"
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
                : 0),
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
          final: "won",
          finalWin: true,
        });
        return;
      } else if (
        loseCount >= 3 ||
        (drawCount >= 4 && loseCount >= 1) ||
        (drawCount >= 3 && loseCount >= 2)
      ) {
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
              p2Cash +
              (commission_roshambo.value_in === "$"
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
          final: "no",
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
      let auth = req.headers.authorization ?? "";
      let {
        id,
        gameInPut,
        round,
        payWith,
      }: {
        id: string;
        gameInPut: number;
        round: number;
        payWith: PayType;
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
      let decoded = (verify(token, secret) as unknown) as {
        id: string;
      };
      let found = await users.findById(decoded.id);
      let game_ = await GameModel.findById(id);
      let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
      let coinInstance = await WalletModel.findOne({ userID: decoded.id });
      let defaultInstance = await defaultModel.findOne({});
      let adminCashInstance = await AdminCashModel.findOne({});
      let p2CashInstance = await CashWalletModel.findOne({
        userID: game_?.members[0],
      });
      if (!found) {
        res.status(406).json({ message: "error found", error: "invalid user" });
        return;
      }
      if (
        !coinInstance ||
        !cashInstance ||
        !defaultInstance ||
        !p2CashInstance ||
        !adminCashInstance ||
        !game_
      ) {
        res
          .status(500)
          .json({ error: "internal error", message: "error found" });
        return;
      }
      const { currentCash: p1Cash } = cashInstance;
      const { currentCoin } = coinInstance;
      const { currentCash: p2Cash } = p2CashInstance;
      // const { currentCash: AdminCurrentCash } = adminCashInstance;
      const { cashRating, commission_penalty } = defaultInstance;
      if (!found) {
        res.status(406).json({ message: "error found", error: "invalid user" });
        return;
      }

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
        if (game_.price_in_value > p1Cash) {
          res
            .status(401)
            .json({ message: "error found", error: "insufficient fund" });
          return;
        }
      }
      await GameModel.findOne({ _id: id })
        .then(async (result) => {
          await new UserPlay({
            player2ID: decoded.id,
            isWin: result?.battleScore.player1[`round${round}`] === gameInPut,
            gameID: result?._id,
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
              userID: game_?.members[0],
              game: Games.penalth_card,
              won: "no",
              earnings: -(commission_penalty.value_in === "$"
                ? (game_?.price_in_value ?? 0) +
                  ((game_?.price_in_value ?? 0) - commission_penalty.value)
                : commission_penalty.value_in === "c"
                ? (game_?.price_in_value ?? 0) +
                  ((game_?.price_in_value ?? 0) -
                    cashRating * commission_penalty.value)
                : commission_penalty.value_in === "%"
                ? (game_?.price_in_value ?? 0) +
                  ((game_?.price_in_value ?? 0) -
                    (game_?.price_in_value ?? 0) / commission_penalty.value)
                : 0),
            }).save();
            await new RecordModel({
              userID: decoded.id,
              game: Games.penalth_card,
              won: "yes",
              earnings:
                commission_penalty.value_in === "$"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) - commission_penalty.value)
                  : commission_penalty.value_in === "c"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) -
                      cashRating * commission_penalty.value)
                  : commission_penalty.value_in === "%"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) -
                      (game_?.price_in_value ?? 0) / commission_penalty.value)
                  : 0,
            }).save();
            await CashWalletModel.updateOne(
              { userID: decoded.id },
              {
                currentCash:
                  p1Cash +
                  (commission_penalty.value_in === "$"
                    ? (game_?.price_in_value ?? 0) +
                      ((game_?.price_in_value ?? 0) - commission_penalty.value)
                    : commission_penalty.value_in === "c"
                    ? (game_?.price_in_value ?? 0) +
                      ((game_?.price_in_value ?? 0) -
                        cashRating * commission_penalty.value)
                    : commission_penalty.value_in === "%"
                    ? (game_?.price_in_value ?? 0) +
                      ((game_?.price_in_value ?? 0) -
                        (game_?.price_in_value ?? 0) / commission_penalty.value)
                    : 0),
              }
            );
            res.json({
              winner: game_?.battleScore.player1[`round${round}`] === gameInPut,
              price:
                commission_penalty.value_in === "$"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) - commission_penalty.value)
                  : commission_penalty.value_in === "c"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) -
                      cashRating * commission_penalty.value)
                  : commission_penalty.value_in === "%"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) -
                      (game_?.price_in_value ?? 0) / commission_penalty.value)
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
                ? (game_?.price_in_value ?? 0) +
                  ((game_?.price_in_value ?? 0) - commission_penalty.value)
                : commission_penalty.value_in === "c"
                ? (game_?.price_in_value ?? 0) +
                  ((game_?.price_in_value ?? 0) -
                    cashRating * commission_penalty.value)
                : commission_penalty.value_in === "%"
                ? (game_?.price_in_value ?? 0) +
                  ((game_?.price_in_value ?? 0) -
                    (game_?.price_in_value ?? 0) / commission_penalty.value)
                : 0),
            }).save();
            await new RecordModel({
              userID: game_?.members[0],
              game: Games.penalth_card,
              won: "yes",
              earnings:
                commission_penalty.value_in === "$"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) - commission_penalty.value)
                  : commission_penalty.value_in === "c"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) -
                      cashRating * commission_penalty.value)
                  : commission_penalty.value_in === "%"
                  ? (game_?.price_in_value ?? 0) +
                    ((game_?.price_in_value ?? 0) -
                      (game_?.price_in_value ?? 0) / commission_penalty.value)
                  : 0,
            }).save();
            await CashWalletModel.updateOne(
              { userID: game_?.members[0] },
              {
                currentCash:
                  p2Cash +
                  (commission_penalty.value_in === "$"
                    ? (game_?.price_in_value ?? 0) +
                      ((game_?.price_in_value ?? 0) - commission_penalty.value)
                    : commission_penalty.value_in === "c"
                    ? (game_?.price_in_value ?? 0) +
                      ((game_?.price_in_value ?? 0) -
                        cashRating * commission_penalty.value)
                    : commission_penalty.value_in === "%"
                    ? (game_?.price_in_value ?? 0) +
                      ((game_?.price_in_value ?? 0) -
                        (game_?.price_in_value ?? 0) / commission_penalty.value)
                    : 0),
              }
            );
            res.json({
              winner: game_?.battleScore.player1[`round${round}`] === gameInPut,
              price: 0,
              final: true,
              finalWin: false,
            });
            return;
          } else {
            res.json({
              winner: game_?.battleScore.player1[`round${round}`] === gameInPut,
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
    let auth = req.headers.authorization ?? "";
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
    const defaultInstance = await defaultModel.findOne({});
    const cashRating = defaultInstance?.cashRating ?? 0;
    const {
      title,
      description,
      memberCount,
      price,
      winnerPrice,
      winnerCount,
      endDateTime,
    }: {
      title: string;
      description: string;
      memberCount: number;
      price: number;
      winnerPrice: number;
      winnerCount: number;
      endDateTime: Date;
    } = req.body;
    await new GameModel({
      gameMemberCount: memberCount,
      members: [],
      priceType: "virtual",
      price_in_coin: price * cashRating,
      price_in_value: price,
      gameDetail: "Lucky geoge.",
      gameID: Games.lucky_geoge,
      battleScore: {
        player1: { title, description, winnerCount, winnerPrice, endDateTime },
      },
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
    let auth = req.headers.authorization ?? "";
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
      adminID?: string;
    };
    let user = await users.findById(decoded.id);
    let admin = await AdminModel.findById(decoded?.adminID);
    if (admin) {
      await GameModel.find({ gameID: Games.lucky_geoge, played: false })
        .then((games) => {
          res.json({ games });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
      return;
    } else if (user) {
      let currentCash =
        (await CashWalletModel.findOne({ userID: decoded.id }))?.currentCash ??
        0;
      let currentCoin =
        (await WalletModel.findOne({ userID: decoded.id }))?.currentCoin ?? 0;
      let allG = await GameModel.find({
        gameID: Games.lucky_geoge,
        played: false,
      });
      await GameModel.find({
        gameID: Games.lucky_geoge,
        played: false,
        $or: [
          { price_in_value: { $lte: currentCash } },
          { price_in_coin: { $lte: currentCoin } },
        ],
      })
        .then((games) => {
          res.json(admin ? { games: allG } : { games });
        })
        .catch((error) => {
          res.status(500).json({ message: "error found", error });
        });
      return;
    } else {
      res.status(419).json({ message: "error found", error: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.post("/lucky-geoge/play", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization ?? "";
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
    let currentCash =
      (await CashWalletModel.findOne({ userID: decoded.id }))?.currentCash ?? 0;
    let currentCoin =
      (await WalletModel.findOne({ userID: decoded.id }))?.currentCoin ?? 0;
    const {
      id,
      payWith,
    }: {
      id: string;
      payWith: PayType;
    } = req.body;
    let { price_in_coin: stack, price_in_value } = (await GameModel.findById(
      id
    )) ?? { price_in_coin: 0, price_in_value: 0 };
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
    let ticket = randGenerate({
      length: 12,
      charset: "alphabetic",
    });
    await GameModel.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          members: decoded.id,
          players: {
            player_name: user.full_name,
            phone_number: user.phone_number,
            winner: false,
            ticket,
            date: new Date(),
            id: user._id,
          },
        },
      }
    )
      .then(async (result) => {
        res.json({ message: "successful", price: result?.price_in_value });
        if ((result?.members.length ?? 0) >= (result?.gameMemberCount ?? 0)) {
          let winners = shuffle(result?.members ?? [""]).slice(
            0,
            result?.battleScore.player1.winnerCount
          );
          for (let member in result?.members) {
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
            let { currentCash } = (await CashWalletModel.findById(winner)) ?? {
              currentCash: 0,
            };

            await RecordModel.updateOne(
              {
                userID: winner,
              },
              {
                won: "yes",
                earnings: result?.battleScore.player1.winnerPrice,
                date_mark: new Date(),
              }
            );
            await CashWalletModel.updateOne(
              { _id: winner },
              {
                currentCash:
                  (currentCash ?? 0) + result?.battleScore.player1.winnerPrice,
              }
            );
          }
          await GameModel.updateOne({ _id: id }, { played: true })
            .then(() => {})
            .catch(console.error);
        }
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.post("/lucky-judge/update", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization ?? "";
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
    let user = await AdminModel.findById(decoded.adminID);
    if (!user) {
      res.status(419).json({ message: "error found", error: "User not found" });
      return;
    }
    const {
      id,
      newGameTime,
    }: {
      id: string;
      newGameTime: Date;
    } = req.body;
    let { battleScore } = (await GameModel.findOne({ _id: id })) ?? {
      battleScore: { player1: {}, player2: {} },
    };
    await GameModel.findOneAndUpdate(
      { _id: id },
      {
        battleScore: {
          player1: {
            ...battleScore.player1,
            endDateTime: newGameTime,
          },
          player2: {},
        },
      }
    )
      .then(async () => {
        res.json({ message: "successful" });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

GamesRouter.delete("/lucky-judge", async (req: Request, res: Response) => {
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
    const id = (req.query.id as unknown) as string;
    await GameModel.deleteOne({ _id: id })
      .then(() => {
        res.json({ message: "deleted successfully" });
      })
      .catch((error) => {
        res.status(500).json({ message: "error", error });
      });
  } catch (error) {
    res.status(500).json({ error });
  }
});

GamesRouter.post("/penalty/exit", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization ?? "";
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_penalty } = (await defaultModel.findOne(
      {}
    )) ?? { cashRating: 0, commission_penalty: { value: 0, value_in: "$" } };
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = (await CashWalletModel.findOne({
      userID: game_?.members[0],
    })) ?? { currentCash: 0 };
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
      userID: game_?.members[0],
      game: Games.penalth_card,
      won: "yes",
      earnings:
        commission_penalty.value_in === "$"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) - commission_penalty.value)
          : commission_penalty.value_in === "c"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) -
              cashRating * commission_penalty.value)
          : commission_penalty.value_in === "%"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) -
              (game_?.price_in_value ?? 0) / commission_penalty.value)
          : p1Cash,
    }).save();
    await CashWalletModel.updateOne(
      { userID: game_?.members[0] },
      {
        p1Cash:
          commission_penalty.value_in === "$"
            ? p1Cash +
              (game_?.price_in_value ?? 0) +
              ((game_?.price_in_value ?? 0) - commission_penalty.value)
            : commission_penalty.value_in === "c"
            ? (game_?.price_in_value ?? 0) +
              p1Cash +
              ((game_?.price_in_value ?? 0) -
                cashRating * commission_penalty.value)
            : commission_penalty.value_in === "%"
            ? (game_?.price_in_value ?? 0) +
              p1Cash +
              ((game_?.price_in_value ?? 0) -
                (game_?.price_in_value ?? 0) / commission_penalty.value)
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
    let auth = req.headers.authorization ?? "";
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_roshambo } = (await defaultModel.findOne(
      {}
    )) ?? { cashRating: 0, commission_roshambo: { value: 0, value_in: "$" } };
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = (await CashWalletModel.findOne({
      userID: game_?.members[0],
    })) ?? { currentCash: 0 };
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await new RecordModel({
      userID: game_?.members[0],
      game: Games.roshambo,
      won: "yes",
      earnings:
        commission_roshambo.value_in === "$"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) - commission_roshambo.value)
          : commission_roshambo.value_in === "c"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) -
              cashRating * commission_roshambo.value)
          : commission_roshambo.value_in === "%"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) -
              (game_?.price_in_value ?? 0) / commission_roshambo.value)
          : p1Cash,
    }).save();
    await new RecordModel({
      userID: decoded.id,
      game: Games.roshambo,
      won: "no",
      earnings: 0,
    }).save();
    await CashWalletModel.updateOne(
      { userID: game_?.members[0] },
      {
        p1Cash:
          commission_roshambo.value_in === "$"
            ? p1Cash +
              (game_?.price_in_value ?? 0) +
              ((game_?.price_in_value ?? 0) - commission_roshambo.value)
            : commission_roshambo.value_in === "c"
            ? (game_?.price_in_value ?? 0) +
              p1Cash +
              ((game_?.price_in_value ?? 0) -
                cashRating * commission_roshambo.value)
            : commission_roshambo.value_in === "%"
            ? (game_?.price_in_value ?? 0) +
              p1Cash +
              ((game_?.price_in_value ?? 0) -
                (game_?.price_in_value ?? 0) / commission_roshambo.value)
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
    let auth = req.headers.authorization ?? "";
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_guess_mater } = (await defaultModel.findOne(
      {}
    )) ?? {
      cashRating: 0,
      commission_guess_mater: { value: 0, value_in: "$" },
    };
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = (await CashWalletModel.findOne({
      userID: game_?.members[0],
    })) ?? { currentCash: 0 };
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await new RecordModel({
      userID: game_?.members[0],
      game: Games.roshambo,
      won: "yes",
      earnings:
        commission_guess_mater.value_in === "$"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) - commission_guess_mater.value)
          : commission_guess_mater.value_in === "c"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) -
              cashRating * commission_guess_mater.value)
          : commission_guess_mater.value_in === "%"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) -
              (game_?.price_in_value ?? 0) / commission_guess_mater.value)
          : p1Cash,
    }).save();
    await new RecordModel({
      userID: decoded.id,
      game: Games.roshambo,
      won: "no",
      earnings:
        commission_guess_mater.value_in === "$"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) - commission_guess_mater.value)
          : commission_guess_mater.value_in === "c"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) -
              cashRating * commission_guess_mater.value)
          : commission_guess_mater.value_in === "%"
          ? (game_?.price_in_value ?? 0) +
            ((game_?.price_in_value ?? 0) -
              (game_?.price_in_value ?? 0) / commission_guess_mater.value)
          : p1Cash,
    }).save();
    await CashWalletModel.updateOne(
      { userID: game_?.members[0] },
      {
        p1Cash:
          commission_guess_mater.value_in === "$"
            ? p1Cash +
              (game_?.price_in_value ?? 0) +
              ((game_?.price_in_value ?? 0) - commission_guess_mater.value)
            : commission_guess_mater.value_in === "c"
            ? (game_?.price_in_value ?? 0) +
              p1Cash +
              ((game_?.price_in_value ?? 0) -
                cashRating * commission_guess_mater.value)
            : commission_guess_mater.value_in === "%"
            ? (game_?.price_in_value ?? 0) +
              p1Cash +
              ((game_?.price_in_value ?? 0) -
                (game_?.price_in_value ?? 0) / commission_guess_mater.value)
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
    let auth = req.headers.authorization ?? "";
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
      res.status(406).json({
        message: "error found",
        error: "user no found",
      } as errorResHint);
      return;
    }
    const { cashRating } = (await defaultModel.findOne({})) ?? {
      cashRating: 0,
    };
    const { currentCash } = (await CashWalletModel.findOne({
      userID: decoded.id,
    })) ?? { currentCash: 0 };

    const {
      player2Username,
      price_in_value,
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
    const p2 = await PlayerModel.findOne({ playername: player2Username });

    if ((!p2 || p2.userID === decoded.id) && player2Username !== "") {
      res
        .status(409)
        .json({ message: "error found", error: "player 2 not found" });
      return;
    }
    await new GameModel({
      gameMemberCount: 2,
      members: p2 ? [decoded.id, p2.userID] : [decoded.id],
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
      let auth = req.headers.authorization ?? "";
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
      const { currentCash } = (await CashWalletModel.findOne({
        userID: decoded.id,
      })) ?? { currentCash: 0 };
      const { currentCoin } = (await WalletModel.findOne({
        userID: decoded.id,
      })) ?? { currentCoin: 0 };
      const {
        price_in_value,
        price_in_coin,
        battleScore,
        members,
      } = (await GameModel.findById(gameID)) ?? {
        price_in_coin: 0,
        price_in_value: 0,
        battleScore: { player1: {}, player2: {} },
        members: [],
      };
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
            members: [...members, decoded.id],
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
    let auth = req.headers.authorization ?? "";
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
    let decoded = (verify(token, secret) as unknown) as {
      id: string;
    };
    let found = await users.findById(decoded.id);
    const { cashRating, commission_custom_game } = (await defaultModel.findOne(
      {}
    )) ?? {
      cashRating: 0,
      commission_custom_game: { value: 0, value_in: "$" },
    };
    let game_ = await GameModel.findById(id);
    let { currentCash: p1Cash } = (await CashWalletModel.findOne({
      userID: game_?.members[0],
    })) ?? { currentCash: 0 };
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    await GameModel.updateOne({ _id: id }, { played: true });
    await new RecordModel({
      userID: game_?.members[0],
      game: Games.custom_game,
      won: "rejected",
      earnings: game_?.price_in_value,
    }).save();
    await CashWalletModel.updateOne(
      { userID: game_?.members[0] },
      {
        p1Cash:
          commission_custom_game.value_in === "$"
            ? p1Cash +
              (game_?.price_in_value ?? 0) +
              ((game_?.price_in_value ?? 0) - commission_custom_game.value)
            : commission_custom_game.value_in === "c"
            ? (game_?.price_in_value ?? 0) +
              p1Cash +
              ((game_?.price_in_value ?? 0) -
                cashRating * commission_custom_game.value)
            : commission_custom_game.value_in === "%"
            ? (game_?.price_in_value ?? 0) +
              p1Cash +
              ((game_?.price_in_value ?? 0) -
                (game_?.price_in_value ?? 0) / commission_custom_game.value)
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
    let auth = req.headers.authorization ?? "";
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
      res.status(419).json({
        message: "error found",
        error: "user no found",
      } as errorResHint);
      return;
    }
    await GameModel.find({
      isComplete: false,
      gameID: Games.custom_game,
      members: decoded.id,
      played: false,
    })
      .sort({ date: -1 })
      .then((result) => {
        res.json({
          message: "content found",
          requests: filter(result, (__game) => {
            return __game.members[0] !== decoded.id;
          }),
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

GamesRouter.get("/custom-game/games", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization ?? "";
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
      res.status(419).json({
        message: "error found",
        error: "user no found",
      } as errorResHint);
      return;
    }
    await GameModel.find({
      played: true,
      gameID: Games.custom_game,
      isComplete: false,
    })
      .sort({ date: -1 })
      .then((requests) => {
        res.json({ message: "content found", requests });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
    console.error(error);
  }
});

GamesRouter.post("/custom-game/judge", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization ?? "";
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
      res.status(406).json({
        message: "error found",
        error: "user no found",
      } as errorResHint);
      return;
    }
    const { choice, game_id }: { choice: string; game_id: string; } = req.body;
    let game_played = await GameModel.findOne({ _id: game_id });
    let defaultInstance = await defaultModel.findOne({});
    let cashInstance = await CashWalletModel.findOne({ userID: decoded.id });
    let p2CashInstance = await CashWalletModel.findOne({
      userID: game_played?.members[0],
    });
    if (!defaultInstance || !cashInstance || !p2CashInstance) {
      res.status(406).json({
        message: "error found",
        error: "Bad instance",
      } as errorResHint);
      return;
    };
    // const { currentCash: p1Cash } = cashInstance;
    // const { currentCash: p2Cash } = p2CashInstance;
    // const { cashRating, commission_custom_game } = defaultInstance;
    if (game_played?.members[0] === decoded.id) {
      await GameModel.updateOne(
        { _id: game_id },
        {
          battleScore: {
            player1: {
              ...game_played.battleScore.player1,
              correct_answer: choice,
            },
            player2: {
              ...game_played.battleScore.player2,
            },
          },
        }
      ).then(() => {
        res.json({ message: "done" });
      }).catch(() => {
        res.status(500).json({ error: "not your game" });
      });
    } else if (game_played?.members[1] === decoded.id) {
      await GameModel.updateOne(
        { _id: game_id },
        {
          battleScore: {
            player1: {
              ...game_played.battleScore.player1,
            },
            player2: {
              ...game_played.battleScore.player2,
              correct_answer: choice,
            },
          },
        }
      ).then(() => {
        res.json({ message: "done" });
      }).catch(() => {
        res.status(500).json({ error: "not your game" });
      });
    } else {
      res.status(500).json({ error: "not your game" });
    }
  } catch (error) {
    res.status(500).json({ error, message: "error found" } as errorResHint);
    console.error(error);
  }
});

GamesRouter.get("/custom-game/disputes", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization ?? "";
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
      adminID: string;
    };
    let found = await AdminModel.findById(decoded.adminID);
    if (!found) {
      res.status(406).json({
        message: "error found",
        error: "user no found",
      } as errorResHint);
      return;
    }
    let judgableGames = (
      await GameModel.find({ played: true, isComplete: false })
    ).filter((game) => {
      return (
        isEmpty(game.battleScore.player1.correct_answer) ||
        !isEmpty(game.battleScore.player2.correct_answer)
      );
    });
    res.json({ games: judgableGames });
  } catch (error) {
    res.status(500).json({ error, message: "breakdown" });
    console.log(error);
  }
});


GamesRouter.get(
  "/custom-game/disputes/oversea",
  async (req: Request, res: Response) => {
    try {
      let auth = req.headers.authorization ?? "";
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
        adminID: string;
      };
      let found = await AdminModel.findById(decoded.adminID);
      if (!found) {
        res.status(406).json({
          message: "error found",
          error: "user no found",
        } as errorResHint);
        return;
      }
      const {id} = req.query as unknown as {id: string}
      let judgableGame = await GameModel.findOne({ _id: id })
      if (!judgableGame) {
        res.status(404).json({ message: "error", error: "not found" })
        return
      }
      let player1 = users.findOne({_id: judgableGame.members[0]})
      let player2 = users.findOne({ _id: judgableGame.members[1] })
      res.json({gameDetail: {...judgableGame, player1, player2}})
    } catch (error) {
      res.status(500).json({ error, message: "breakdown" });
      console.log(error);
    }
  }
);

/*
   let game_played_final = await GameModel.findOne({ _id: game_id });
    if (
      game_played_final?.battleScore.player1.correct_answer &&
      game_played_final?.battleScore.player2.correct_answer
    ) {
      if (
        game_played_final?.battleScore.player1.correct_answer.toLowerCase() ===
        game_played_final?.battleScore.player2.correct_answer.toLowerCase()
      ) {
        if (
          game_played_final?.battleScore.player1.correct_answer.toLowerCase() ===
          game_played_final?.battleScore.player1.answer.toLowerCase()
        ) {
          await new RecordModel({
            userID: game_played_final.members[0],
            game: Games.custom_game,
            won: "yes",
            earnings: PlayerCash(
              commission_custom_game,
              p1Cash,
              game_played_final?.price_in_value ?? 0,
              1,
              cashRating
            ),
          }).save();
          await new RecordModel({
            userID: game_played_final.members[1],
            game: Games.custom_game,
            won: "no",
            earnings: -PlayerCash(
              commission_custom_game,
              p2Cash,
              game_played_final?.price_in_value ?? 0,
              1,
              cashRating
            ),
          }).save();
          await CashWalletModel.updateOne(
            { userID: game_played_final.members[0] },
            {
              currentCash: PlayerCash(
                commission_custom_game,
                p1Cash,
                game_played_final?.price_in_value ?? 0,
                1,
                cashRating
              ),
            }
          )
            .then(() => {
              res.json({
                message: "you won",
                winner: true,
                price: PlayerCash(
                  commission_custom_game,
                  p1Cash,
                  game_played_final?.price_in_value ?? 0,
                  1,
                  cashRating
                ),
              });
            })
            .catch((error) => {
              res
                .status(500)
                .json({ message: "error found", error } as errorResHint);
            });
        } else if (
          game_played_final?.battleScore.player2.correct_answer.toLowerCase() ===
          game_played_final?.battleScore.player2.answer.toLowerCase()
        ) {
          await new RecordModel({
            userID: game_played_final.members[1],
            game: Games.custom_game,
            won: "yes",
            earnings: PlayerCash(
              commission_custom_game,
              p1Cash,
              game_played_final?.price_in_value ?? 0,
              1,
              cashRating
            ),
          }).save();
          await new RecordModel({
            userID: game_played_final.members[0],
            game: Games.custom_game,
            won: "no",
            earnings: -PlayerCash(
              commission_custom_game,
              p2Cash,
              game_played_final?.price_in_value ?? 0,
              1,
              cashRating
            ),
          }).save();
          await CashWalletModel.updateOne(
            { userID: game_played_final.members[1] },
            {
              currentCash: PlayerCash(
                commission_custom_game,
                p1Cash,
                game_played_final?.price_in_value ?? 0,
                1,
                cashRating
              ),
            }
          )
            .then(() => {
              res.json({
                message: "you won",
                winner: true,
                price: PlayerCash(
                  commission_custom_game,
                  p1Cash,
                  game_played_final?.price_in_value ?? 0,
                  1,
                  cashRating
                ),
              });
            })
            .catch((error) => {
              res
                .status(500)
                .json({ message: "error found", error } as errorResHint);
            });
        } else {
          await new RecordModel({
            userID: game_played_final.members[1],
            game: Games.custom_game,
            won: "yes",
            earnings: PlayerDrawCash(
              commission_custom_game,
              p1Cash,
              game_played_final?.price_in_value ?? 0,
              1,
              cashRating
            ),
          }).save();
          await new RecordModel({
            userID: game_played_final.members[0],
            game: Games.custom_game,
            won: "no",
            earnings: -PlayerDrawCash(
              commission_custom_game,
              p2Cash,
              game_played_final?.price_in_value ?? 0,
              1,
              cashRating
            ),
          }).save();
          await CashWalletModel.updateOne(
            { userID: game_played_final.members[1] },
            {
              currentCash: PlayerDrawCash(
                commission_custom_game,
                p1Cash,
                game_played_final?.price_in_value ?? 0,
                1,
                cashRating
              ),
            }
          )
            .then(() => {
              res.json({
                message: "you won",
                winner: true,
                price: PlayerCash(
                  commission_custom_game,
                  p1Cash,
                  game_played_final?.price_in_value ?? 0,
                  1,
                  cashRating
                ),
              });
            })
            .catch((error) => {
              res
                .status(500)
                .json({ message: "error found", error } as errorResHint);
            });
        }
      } else {
        res.json({ message: "done" });
      }
    }
*/

export default GamesRouter;
