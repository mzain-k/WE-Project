import mongoose from "mongoose";
import {
  MAIN_POSITIONS,
  RESERVE_POSITIONS,
} from "../config/turf.js";

const playerSchema = new mongoose.Schema(
  {
    team: {
      type: String,
      enum: ["A", "B"],
      required: true,
    },
    position: {
      type: String,
      enum: [...MAIN_POSITIONS, ...RESERVE_POSITIONS],
      required: true,
    },
    isReserve: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cmsId: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  },
);

const matchSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    slotStart: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "full", "completed", "cancelled"],
      default: "open",
    },
    note: {
      type: String,
      default: "",
    },
    teamAClosed: {
      type: Boolean,
      default: false,
    },
    teamBClosed: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    players: [playerSchema],
  },
  {
    timestamps: true,
  },
);

matchSchema.index(
  {
    date: 1,
    slotStart: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
    },
  },
);

const Match = mongoose.model("Match", matchSchema);

export default Match;