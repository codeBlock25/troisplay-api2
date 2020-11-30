import { concat, isEmpty, remove, set } from "lodash";
import AdminCashModel from "../model/admin_model";
import notificationModel from "../model/notification";
import { GameRec } from "../model/plays";
import { notificationHintType, RoshamboOption } from "../types/enum";

export const NotificationAction = {
  add: async ({
    message,
    userID,
    type,
  }: {
    message: string;
    userID: string;
    type?: notificationHintType;
  }) =>
    await notificationModel.updateOne(
      { userID },
      {
        $push: {
          notifications: {
            message,
            type: type ?? notificationHintType.win,
            time: new Date(),
            hasNew: true,
          },
        },
      }
    ),
  markRead: async ({ userID }: { userID: string; time: Date }) => {
    let allNotifications = await notificationModel.findOne({ userID });
    if (!allNotifications) return;
    let { notifications } = allNotifications;
    let removed = remove(notifications, { hasNew: true });
    removed.map((init) => {
      set(init, "hasNew", false);
    });
    return await notificationModel.findOneAndUpdate(
      { userID },
      {
        notifications: [...notifications, ...removed],
      }
    );
  },
};

export async function PlayAdmin(
  commission: { value: number; value_in: "$" | "c" | "%" },
  game_price: number,
  AdminCurrentCash: number,
  cashRating: number,
  memberCount: number | undefined
) {
  return await AdminCashModel.updateOne(
    {},
    {
      currentCash: AdminCash(
        commission,
        AdminCurrentCash,
        game_price,
        memberCount ?? 2,
        cashRating
      ),
    }
  );
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
): boolean {
  let count = 0;
  p1.round1 === p2.round1 ? count++ : count--;
  p1.round2 === p2.round2 ? count++ : count--;
  p1.round3 === p2.round3 ? count++ : count--;
  p1.round4 === p2.round4 ? count++ : count--;
  p1.round5 === p2.round5 ? count++ : count--;
  return count >= 3;
}

export function AdminCash(
  commission: { value: number; value_in: "$" | "c" | "%" },
  adminCurrentCash: number,
  game_price: number,
  memberCount: number,
  cashRating: number
) {
  return commission.value_in === "$"
    ? adminCurrentCash + commission.value * memberCount
    : commission.value_in === "c"
    ? adminCurrentCash + cashRating * commission.value * memberCount
    : commission.value_in === "%"
    ? adminCurrentCash +
      (game_price - ((100 - commission.value) / 100) * game_price) * memberCount
    : adminCurrentCash;
}
export function PlayerCash(
  commission: { value: number; value_in: "$" | "c" | "%" },
  playerCash: number,
  game_price: number,
  memberCount: number,
  cashRating: number
) {
  return commission.value_in === "$"
    ? playerCash + commission.value * memberCount
    : commission.value_in === "c"
    ? playerCash + cashRating * commission.value * memberCount
    : commission.value_in === "%"
    ? playerCash +
      (game_price - (commission.value / 100) * game_price) * memberCount
    : playerCash;
}

export function PlayerCashLeft(
  commission: { value: number; value_in: "$" | "c" | "%" },
  playerCash: number,
  game_price: number,
  memberCount: number,
  cashRating: number
) {
  return commission.value_in === "$"
    ? playerCash + commission.value * memberCount
    : commission.value_in === "c"
    ? playerCash + cashRating * commission.value * memberCount
    : commission.value_in === "%"
    ? playerCash - (game_price - (commission.value / 100) * game_price)
    : playerCash;
}

export function PlayerCoinLeft(
  commission: { value: number; value_in: "$" | "c" | "%" },
  playerCoin: number,
  game_price: number,
  memberCount: number,
  cashRating: number
) {
  return commission.value_in === "$"
    ? playerCoin + commission.value * memberCount
    : commission.value_in === "c"
    ? playerCoin + cashRating * commission.value * memberCount
    : commission.value_in === "%"
    ? playerCoin -
      (game_price - (commission.value / 100) * game_price) * memberCount
    : playerCoin;
}

export function PlayerDrawCash(
  commission: { value: number; value_in: "$" | "c" | "%" },
  playerCash: number,
  game_price: number,
  memberCount: number,
  cashRating: number
) {
  return commission.value_in === "$"
    ? playerCash + commission.value * memberCount
    : commission.value_in === "c"
    ? playerCash + cashRating * commission.value * memberCount
    : commission.value_in === "%"
    ? playerCash + (game_price - (commission.value / 100) * game_price) * 1
    : playerCash;
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
): GameRec {
  let round1 = MarkRoshamboGame(p1.round1, p2.round1),
    round2 = MarkRoshamboGame(p1.round2, p2.round2),
    round3 = MarkRoshamboGame(p1.round3, p2.round3),
    round4 = MarkRoshamboGame(p1.round4, p2.round4),
    round5 = MarkRoshamboGame(p1.round5, p2.round5),
    winCount: number = 0,
    lossCount: number = 0,
    drawCount: number = 0;
  round1 === GameRec.win
    ? winCount++
    : round1 === GameRec.draw
    ? drawCount++
    : lossCount++;
  round2 === GameRec.win
    ? winCount++
    : round2 === GameRec.draw
    ? drawCount++
    : lossCount++;
  round3 === GameRec.win
    ? winCount++
    : round3 === GameRec.draw
    ? drawCount++
    : lossCount++;
  round4 === GameRec.win
    ? winCount++
    : round4 === GameRec.draw
    ? drawCount++
    : lossCount++;
  round5 === GameRec.win
    ? winCount++
    : round5 === GameRec.draw
    ? drawCount++
    : lossCount++;
  let final =
    drawCount === 5 ||
    (drawCount === 3 && winCount === lossCount) ||
    (drawCount === 1 && winCount === lossCount)
      ? GameRec.draw
      : winCount > lossCount
      ? GameRec.win
      : GameRec.lose;
  return final;
}

export function FindWinnerOnMatcher(p1: number, p2: number) {
  return p1 === p2;
}

export function shuffle(array: string[]): string[] {
  return array.sort(() => Math.random() - 0.5);
}
