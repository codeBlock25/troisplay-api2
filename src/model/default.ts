import { Model, Schema, model, Document } from "mongoose";

export interface defaultHint extends Document {
  commission_roshambo: {
    value: number;
    value_in: "$" | "%" | "c";
  };
  commission_penalty: {
    value: number;
    value_in: "$" | "%" | "c";
  };
  commission_guess_mater: {
    value: number;
    value_in: "$" | "%" | "c";
  };
  commission_custom_game: {
    value: number;
    value_in: "$" | "%" | "c";
  };
  cashRating: number;
  min_stack_roshambo: number;
  min_stack_penalty: number;
  min_stack_guess_master: number;
  min_stack_custom: number;
  referRating: number;
}

const defaultSchema: Schema<defaultHint> = new Schema({
  commission_roshambo: {
    type: {
      value: Number,
      value_in: String,
    },
    required: true,
  },
  commission_penalty: {
    type: {
      value: Number,
      value_in: String,
    },
    required: true,
  },
  commission_guess_mater: {
    type: {
      value: Number,
      value_in: String,
    },
    required: true,
  },
  commission_custom_game: {
    type: {
      value: Number,
      value_in: String,
    },
    required: true,
  },
  cashRating: {
    type: Number,
    required: true,
  },
  min_stack_roshambo: {
    type: Number,
    required: true,
  },
  min_stack_penalty: {
    type: Number,
    required: true,
  },
  min_stack_guess_master: {
    type: Number,
    required: true,
  },
  min_stack_custom: {
    type: Number,
    required: true,
  },
  referRating: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const defaultModel: Model<defaultHint, {}> = model("defaults", defaultSchema);

export default defaultModel;
