import { Schema, model, Model, Document } from "mongoose";

export enum Games {
  roshambo,
  penalth_card,
  glory_spin,
  custom_game,
  matcher,
  non,
  lucky_geoge,
  rooms,
}

export interface GameType extends Document {
  gameMemberCount: number;
  members: string[];
  priceType: string;
  price_in_value: number;
  gameType: string;
  price_in_coin: number;
  gameDetail: string;
  gameID: Games;
  played: boolean;
  date: Date;
  battleScore: {
    player1: any;
    player2: any;
  };
  playCount: number;
  isComplete: boolean;
  players: {
    player_name: string;
    phone_number: string;
    ticket: string;
    winner: Boolean;
    date: Date;
    id: string;
  }[];
}
export interface GameDocType {
  gameMemberCount: number;
  members: string[];
  priceType: string;
  price_in_coin: number;
  price_in_value: number;
  gameType: string;
  gameDetail: string;
  gameID: Games;
  played: boolean;
  date: Date;
  battleScore: {
    player1: any;
    player2: any;
  };
  playCount: number;
  isComplete: boolean;
}

const GameSchema: Schema<GameDocType> = new Schema({
  gameMemberCount: {
    type: Number,
    required: true,
    default: 1,
  },
  members: {
    type: [String],
    required: true,
  },
  price_in_coin: {
    type: Number,
    required: true,
    default: 0,
  },
  price_in_value: {
    type: Number,
    required: true,
    default: 0,
  },
  gameType: {
    type: String,
    required: true,
    default: "defined",
    lowercase: true,
  },
  gameDetail: {
    type: String,
    lowercase: true,
  },
  gameID: {
    type: Games,
    required: true,
  },
  battleScore: {
    type: Object,
  },
  played: {
    type: Boolean,
    required: true,
    default: false,
  },
  playCount: {
    type: Number,
    default: 1,
  },
  players: {
    type: [
      {
        id: String,
        player_name: String,
        phone_number: String,
        ticket: String,
        winner: Boolean,
        date: Boolean,
      },
    ],
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

const GameModel: Model<GameType, {}> = model<GameType>("games", GameSchema);

export default GameModel;
