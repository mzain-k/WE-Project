import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  MAIN_POSITIONS,
  RESERVE_POSITIONS,
} from "../utils/constants";
import {
  getNextDates,
  formatDateParts,
  formatHour,
} from "../utils/dateTime";

const dates = getNextDates(14);

const inputClass =
  "w-full border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-green-600 bg-white";

const createEmptyTeam = () => {
  const team = {};

  [...MAIN_POSITIONS, ...RESERVE_POSITIONS].forEach((pos) => {
    team[pos] = {
      name: "",
      cmsId: "",
    };
  });

  return team;
};

const NewBooking = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(dates[0]);
  const [slots, setSlots] = useState([]);
  const [slotStart, setSlotStart] = useState(null);
  const [mode, setMode] = useState("player");
  const [position, setPosition] = useState("");
  const [team, setTeam] = useState(createEmptyTeam());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSlotStart(null);

    api
      .get("/slots", {
        params: {
          date,
        },
      })
      .then((res) => setSlots(res.data.slots))
      .catch(() => setError("Could not load slots"));
  }, [date]);

  const updateTeam = (pos, field, value) => {
    setTeam({
      ...team,
      [pos]: {
        ...team[pos],
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (slotStart === null) {
      return setError("Select a time slot");
    }

    const payload = {
      date,
      slotStart,
      note,
      mode,
    };

    if (mode === "player") {
      if (!position) {
        return setError("Select your position");
      }

      payload.position = position;
    } else {
      payload.players = Object.entries(team)
        .filter(([, player]) => player.name.trim() || player.cmsId.trim())
        .map(([pos, player]) => {
          return {
            position: pos,
            name: player.name.trim(),
            cmsId: player.cmsId.trim(),
          };
        });
    }

    setBusy(true);

    try {
      await api.post("/matches", payload);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");

      api
        .get("/slots", {
          params: {
            date,
          },
        })
        .then((res) => setSlots(res.data.slots));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="font-display text-4xl tracking-wide text-green-700">
        New booking
      </h1>

      <section>
        <h2 className="font-medium mb-2">1. Pick a date</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((d) => {
            const parts = formatDateParts(d);
            const active = d === date;

            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`shrink-0 w-16 rounded-xl border py-2 text-center ${
                  active
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-slate-300"
                }`}
              >
                <div className="text-xs">{parts.weekday}</div>
                <div className="text-lg font-semibold">{parts.day}</div>
                <div className="text-xs">{parts.month}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">2. Pick a time slot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {slots.map((slot) => {
            const free = slot.status === "free";
            const selected = slot.slotStart === slotStart;

            return (
              <button
                key={slot.slotStart}
                disabled={!free}
                onClick={() => setSlotStart(slot.slotStart)}
                className={`rounded-xl border px-2 py-3 text-sm ${
                  selected
                    ? "bg-green-600 text-white border-green-600"
                    : free
                      ? "bg-white border-green-600 text-green-700"
                      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <div>{formatHour(slot.slotStart)}</div>
                {!free && <div className="text-xs capitalize">{slot.status}</div>}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">3. Your team</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setMode("player")}
            className={`rounded-xl border py-3 ${
              mode === "player"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white border-slate-300"
            }`}
          >
            I'll join as a player
          </button>
          <button
            onClick={() => setMode("fullTeam")}
            className={`rounded-xl border py-3 ${
              mode === "fullTeam"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white border-slate-300"
            }`}
          >
            I have a full team
          </button>
        </div>

        {mode === "player" ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {MAIN_POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`rounded-xl border py-3 font-medium ${
                  position === pos
                    ? "bg-yellow-400 border-yellow-400"
                    : "bg-white border-slate-300"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[...MAIN_POSITIONS, ...RESERVE_POSITIONS].map((pos) => (
              <div key={pos} className="grid grid-cols-[3rem_1fr_1fr] gap-2 items-center">
                <span className="text-sm font-medium text-slate-600">{pos}</span>
                <input
                  className={inputClass}
                  placeholder="Name"
                  value={team[pos].name}
                  onChange={(e) => updateTeam(pos, "name", e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="CMS ID"
                  value={team[pos].cmsId}
                  onChange={(e) => updateTeam(pos, "cmsId", e.target.value)}
                />
              </div>
            ))}
            <p className="text-xs text-slate-500">
              R1 and R2 are optional reserves. Leave them empty if not needed.
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-medium mb-2">4. Note (optional)</h2>
        <input
          className={inputClass}
          maxLength={200}
          placeholder="e.g. Friendly match, bring your own shoes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl py-3 disabled:opacity-60"
      >
        {busy ? "Posting..." : "Post match"}
      </button>
    </div>
  );
};

export default NewBooking;