import mongoose from "mongoose";
import Match from "../models/Match.js";
import SlotBlock from "../models/SlotBlock.js";
import {
  MAIN_POSITIONS,
  RESERVE_POSITIONS,
} from "../config/turf.js";
import {
  getToday,
  isValidDateString,
  isDateInWindow,
  getSlotHours,
  isSlotPast,
} from "../utils/dateTime.js";

const validateFullTeam = (players) => {
  if (!Array.isArray(players)) {
    return "Team players are required";
  }

  const allowed = [...MAIN_POSITIONS, ...RESERVE_POSITIONS];
  const seenPositions = new Set();
  const seenCmsIds = new Set();

  for (const player of players) {
    const name = String(player.name || "").trim();
    const cmsId = String(player.cmsId || "").trim();

    if (!allowed.includes(player.position)) {
      return "Invalid position";
    }

    if (seenPositions.has(player.position)) {
      return `Duplicate position ${player.position}`;
    }

    if (!name || !cmsId) {
      return `Name and CMS ID are required for ${player.position}`;
    }

    if (seenCmsIds.has(cmsId)) {
      return "The same CMS ID is used twice";
    }

    seenPositions.add(player.position);
    seenCmsIds.add(cmsId);
  }

  const missing = MAIN_POSITIONS.filter((pos) => !seenPositions.has(pos));

  if (missing.length > 0) {
    return "A full team needs all 6 main positions";
  }

  return null;
};

const getSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDateString(date) || !isDateInWindow(date)) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    const [matches, blocks] = await Promise.all([
      Match.find({
        date,
        isActive: true,
      }).select("slotStart"),
      SlotBlock.find({
        date,
      }).select("slotStart"),
    ]);

    const slots = getSlotHours().map((hour) => {
      let status = "free";

      if (isSlotPast(date, hour)) {
        status = "past";
      } else if (blocks.some((block) => block.slotStart === hour)) {
        status = "blocked";
      } else if (matches.some((match) => match.slotStart === hour)) {
        status = "booked";
      }

      return {
        slotStart: hour,
        status,
      };
    });

    res.json({
      slots,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const createMatch = async (req, res) => {
  try {
    const {
      date,
      slotStart,
      note,
      mode,
      position,
      players,
    } = req.body;
    const slot = Number(slotStart);

    if (!isValidDateString(date) || !isDateInWindow(date)) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    if (!getSlotHours().includes(slot)) {
      return res.status(400).json({
        message: "Invalid slot",
      });
    }

    if (isSlotPast(date, slot)) {
      return res.status(400).json({
        message: "This slot has already started",
      });
    }

    const blocked = await SlotBlock.findOne({
      date,
      slotStart: slot,
    });

    if (blocked) {
      return res.status(409).json({
        message: "This slot is not available",
      });
    }

    let matchPlayers = [];
    let teamAClosed = false;

    if (mode === "player") {
      if (!MAIN_POSITIONS.includes(position)) {
        return res.status(400).json({
          message: "Pick a valid position",
        });
      }

      matchPlayers = [
        {
          team: "A",
          position,
          isReserve: false,
          name: req.user.name,
          cmsId: req.user.cmsId,
          user: req.user._id,
        },
      ];
    } else if (mode === "fullTeam") {
      const error = validateFullTeam(players);

      if (error) {
        return res.status(400).json({
          message: error,
        });
      }

      matchPlayers = players.map((player) => {
        return {
          team: "A",
          position: player.position,
          isReserve: RESERVE_POSITIONS.includes(player.position),
          name: String(player.name).trim(),
          cmsId: String(player.cmsId).trim(),
        };
      });

      teamAClosed = true;
    } else {
      return res.status(400).json({
        message: "Invalid booking type",
      });
    }

    const match = await Match.create({
      createdBy: req.user._id,
      date,
      slotStart: slot,
      note: note ? String(note).trim().slice(0, 200) : "",
      teamAClosed,
      players: matchPlayers,
    });

    res.status(201).json({
      match,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Slot just got booked. Pick another.",
      });
    }

    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getEffectiveStatus = (match) => {
  if (!match.isActive || match.status === "cancelled") {
    return "cancelled";
  }

  if (isSlotPast(match.date, match.slotStart + 1)) {
    return "completed";
  }

  return match.status;
};

const countMain = (players, team) => {
  return players.filter((player) => {
    return player.team === team && !player.isReserve;
  }).length;
};

const getMatches = async (req, res) => {
  try {
    const { date, open } = req.query;
    const filter = {
      isActive: true,
      date: {
        $gte: getToday(),
      },
    };

    if (date) {
      if (!isValidDateString(date)) {
        return res.status(400).json({
          message: "Invalid date",
        });
      }

      filter.date = date;
    }

    const matches = await Match.find(filter)
      .sort({
        date: 1,
        slotStart: 1,
      })
      .populate("createdBy", "name");

    let list = matches
      .map((match) => {
        return {
          _id: match._id,
          date: match.date,
          slotStart: match.slotStart,
          note: match.note,
          status: getEffectiveStatus(match),
          createdBy: match.createdBy?.name || "Unknown",
          teamAClosed: match.teamAClosed,
          teamBClosed: match.teamBClosed,
          teamACount: countMain(match.players, "A"),
          teamBCount: countMain(match.players, "B"),
        };
      })
      .filter((match) => match.status !== "completed");

    if (open === "true") {
      list = list.filter((match) => match.status === "open");
    }

    res.json({
      matches: list,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const match = await Match.findOne({
      _id: id,
      isActive: true,
    }).populate("createdBy", "name cmsId");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    res.json({
      match: {
        ...match.toObject(),
        status: getEffectiveStatus(match),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const joinMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { team, position } = req.body;
    const allPositions = [...MAIN_POSITIONS, ...RESERVE_POSITIONS];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (!["A", "B"].includes(team) || !allPositions.includes(position)) {
      return res.status(400).json({
        message: "Pick a valid team and position",
      });
    }

    const match = await Match.findOne({
      _id: id,
      isActive: true,
    });

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    if (isSlotPast(match.date, match.slotStart)) {
      return res.status(400).json({
        message: "This match has already started",
      });
    }

    const closedField = team === "A" ? "teamAClosed" : "teamBClosed";

    if (match[closedField]) {
      return res.status(400).json({
        message: "This team is already full",
      });
    }

    const updated = await Match.findOneAndUpdate(
      {
        _id: id,
        isActive: true,
        [closedField]: false,
        players: {
          $not: {
            $elemMatch: {
              team,
              position,
            },
          },
        },
        "players.cmsId": {
          $ne: req.user.cmsId,
        },
      },
      {
        $push: {
          players: {
            team,
            position,
            isReserve: RESERVE_POSITIONS.includes(position),
            name: req.user.name,
            cmsId: req.user.cmsId,
            user: req.user._id,
          },
        },
      },
      {
        new: true,
      },
    );

    if (!updated) {
      return res.status(409).json({
        message: "Position just got taken, or you already joined this match",
      });
    }

    const mainCount = updated.players.filter((player) => {
      return !player.isReserve;
    }).length;

    if (mainCount >= MAIN_POSITIONS.length * 2 && updated.status === "open") {
      updated.status = "full";
      await updated.save();
    }

    res.json({
      match: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export {
  getSlots,
  createMatch,
  getMatches,
  getMatchById,
  joinMatch,
};