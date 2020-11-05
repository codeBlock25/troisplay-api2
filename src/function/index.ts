import AdminCashModel from "../model/admin_model";
import { GameRec } from "../model/plays";
import { RoshamboOption } from "../types/enum";

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
) {
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
  let round1 = GameRec.draw;
  let round2 = GameRec.draw;
  let round3 = GameRec.draw;
  let round4 = GameRec.draw;
  let round5 = GameRec.draw;
  (p1.round1 === RoshamboOption.rock &&
    p2.round1 === RoshamboOption.scissors) ||
  (p1.round1 === RoshamboOption.paper &&
    p2.round1 === RoshamboOption.scissors) ||
  (p1.round1 === RoshamboOption.scissors && p2.round1 === RoshamboOption.paper)
    ? (round1 = GameRec.win)
    : p1.round1 === p2.round1
    ? GameRec.draw
    : GameRec.lose;
  (p1.round2 === RoshamboOption.rock &&
    p2.round2 === RoshamboOption.scissors) ||
  (p1.round2 === RoshamboOption.paper &&
    p2.round2 === RoshamboOption.scissors) ||
  (p1.round2 === RoshamboOption.scissors && p2.round2 === RoshamboOption.paper)
    ? (round2 = GameRec.win)
    : p1.round2 === p2.round2
    ? GameRec.draw
    : GameRec.lose;
  (p1.round3 === RoshamboOption.rock &&
    p2.round3 === RoshamboOption.scissors) ||
  (p1.round3 === RoshamboOption.paper &&
    p2.round3 === RoshamboOption.scissors) ||
  (p1.round3 === RoshamboOption.scissors && p2.round3 === RoshamboOption.paper)
    ? (round3 = GameRec.win)
    : p1.round3 === p2.round3
    ? GameRec.draw
    : GameRec.lose;
  (p1.round4 === RoshamboOption.rock &&
    p2.round4 === RoshamboOption.scissors) ||
  (p1.round4 === RoshamboOption.paper &&
    p2.round4 === RoshamboOption.scissors) ||
  (p1.round4 === RoshamboOption.scissors && p2.round4 === RoshamboOption.paper)
    ? (round4 = GameRec.win)
    : p1.round4 === p2.round4
    ? GameRec.draw
    : GameRec.lose;
  (p1.round5 === RoshamboOption.rock &&
    p2.round5 === RoshamboOption.scissors) ||
  (p1.round5 === RoshamboOption.paper &&
    p2.round5 === RoshamboOption.scissors) ||
  (p1.round5 === RoshamboOption.scissors && p2.round5 === RoshamboOption.paper)
    ? (round5 = GameRec.win)
    : p1.round5 === p2.round5
    ? GameRec.draw
    : GameRec.lose;
  let winCount: number = 0;
  let lossCount: number = 0;
  let drawCount: number = 0;
  winCount =
    round1 === GameRec.win
      ? winCount++
      : round1 === GameRec.draw
      ? drawCount++
      : winCount;
  lossCount =
    round1 === GameRec.win
      ? lossCount
      : round1 === GameRec.draw
      ? drawCount
      : lossCount++;
  winCount =
    round2 === GameRec.win
      ? winCount++
      : round2 === GameRec.draw
      ? drawCount++
      : winCount;
  lossCount =
    round2 === GameRec.win
      ? lossCount
      : round2 === GameRec.draw
      ? drawCount
      : lossCount++;
  winCount =
    round3 === GameRec.win
      ? winCount++
      : round3 === GameRec.draw
      ? drawCount++
      : winCount;
  lossCount =
    round3 === GameRec.win
      ? lossCount
      : round3 === GameRec.draw
      ? drawCount
      : lossCount++;
  winCount =
    round4 === GameRec.win
      ? winCount++
      : round4 === GameRec.draw
      ? drawCount++
      : winCount;
  lossCount =
    round4 === GameRec.win
      ? lossCount
      : round4 === GameRec.draw
      ? drawCount
      : lossCount++;
  winCount =
    round5 === GameRec.win
      ? winCount++
      : round5 === GameRec.draw
      ? drawCount++
      : winCount;
  lossCount =
    round5 === GameRec.win
      ? lossCount
      : round5 === GameRec.draw
      ? drawCount
      : lossCount++;
  let final: GameRec =
    drawCount === 5
      ? GameRec.draw
      : winCount > lossCount
      ? GameRec.win
      : GameRec.lose;
  return final;
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
