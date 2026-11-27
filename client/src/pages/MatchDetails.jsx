import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Pitch from "../components/Pitch";
import StatusBadge from "../components/StatusBadge";
import {
  formatDateParts,
  formatHour,
} from "../utils/dateTime";

const MatchDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadMatch = useCallback(async () => {
    try {
      const res = await api.get(`/matches/${id}`);

      setMatch(res.data.match);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load match");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  const handleJoin = async () => {
    if (!selected) {
      return setError("Tap an open position on the pitch");
    }

    setBusy(true);
    setError("");

    try {
      await api.post(`/matches/${id}/join`, selected);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSelected(null);
      await loadMatch();
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-slate-500">Loading...</p>;
  }

  if (!match) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-red-600">{error || "Match not found"}</p>
        <Link to="/" className="text-green-700 font-medium">
          Back to home
        </Link>
      </div>
    );
  }

  const parts = formatDateParts(match.date);
  const alreadyJoined = match.players.some((player) => {
    return player.cmsId === user.cmsId;
  });
  const joinable = ["open", "full"].includes(match.status);
  const locked = !joinable || alreadyJoined;
  const countMain = (team) => {
    return match.players.filter((player) => {
      return player.team === team && !player.isReserve;
    }).length;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      <Link to="/" className="text-sm text-green-700 font-medium">
        &larr; Back
      </Link>

      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-4xl tracking-wide text-green-700">
          {formatHour(match.slotStart)} - {formatHour(match.slotStart + 1)}
        </h1>
        <StatusBadge status={match.status} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-500 space-y-1">
        <p>
          {parts.weekday}, {parts.day} {parts.month} {match.date.slice(0, 4)}
        </p>
        <p>
          Posted by {match.createdBy?.name} ({match.createdBy?.cmsId})
        </p>
        {match.note && <p className="text-slate-700">{match.note}</p>}
      </div>

      <div className="flex justify-between text-sm font-medium px-1">
        <span className="text-green-800">Team A: {countMain("A")} of 6</span>
        <span className="text-blue-700">Team B: {countMain("B")} of 6</span>
      </div>

      <Pitch
        players={match.players}
        closed={{
          A: match.teamAClosed,
          B: match.teamBClosed,
        }}
        selected={selected}
        onSelect={(team, position) => {
          setError("");
          setSelected({
            team,
            position,
          });
        }}
        myCmsId={user.cmsId}
        locked={locked}
      />

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-3 h-3 rounded-full bg-green-900 mr-1" />
          Team A
        </span>
        <span>
          <span className="inline-block w-3 h-3 rounded-full bg-blue-600 mr-1" />
          Team B
        </span>
        <span>
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1" />
          You
        </span>
        <span>
          <span className="inline-block w-3 h-3 rounded-full border border-dashed border-slate-500 mr-1" />
          Open
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {alreadyJoined ? (
        <p className="text-sm text-green-700 font-medium">
          You are in this match.
        </p>
      ) : joinable ? (
        <button
          onClick={handleJoin}
          disabled={busy || !selected}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl py-3 disabled:opacity-60"
        >
          {busy
            ? "Joining..."
            : selected
              ? `Confirm ${selected.position} in Team ${selected.team}`
              : "Tap an open position"}
        </button>
      ) : (
        <p className="text-sm text-slate-500">This match is not open for joining.</p>
      )}
    </div>
  );
};

export default MatchDetails;