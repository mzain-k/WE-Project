import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [selected, setSelected] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadMatch = useCallback(async () => {
    try {
      const res = await api.get(`/matches/${id}`);

      setMatch(res.data.match);
      setNoteDraft(res.data.match.note || "");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load match");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  const runAction = async (action, successMessage) => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await action();

      if (successMessage) {
        setMessage(successMessage);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSelected(null);
      await loadMatch();
      setBusy(false);
    }
  };

  const handleJoin = () => {
    if (!selected) {
      return setError("Tap an open position on the pitch");
    }

    runAction(() => api.post(`/matches/${id}/join`, selected), "You joined the match");
  };

  const handleLeave = () => {
    if (!window.confirm("Leave this match?")) {
      return;
    }

    runAction(() => api.delete(`/matches/${id}/leave`), "You left the match");
  };

  const handleSaveNote = () => {
    runAction(
      () =>
        api.patch(`/matches/${id}`, {
          note: noteDraft,
        }),
      "Note saved",
    );
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this match? The slot will be freed.")) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await api.delete(`/matches/${id}`);
      navigate("/my-matches");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
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
  const myPlayer = match.players.find((player) => {
    return player.cmsId === user.cmsId;
  });
  const joinable = ["open", "full"].includes(match.status);
  const locked = !joinable || Boolean(myPlayer);
  const canLeave = joinable && myPlayer && myPlayer.user;
  const isOwner = match.createdBy?._id === user._id || user.role === "admin";
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
      {message && <p className="text-sm text-green-700">{message}</p>}

      {myPlayer ? (
        <div className="space-y-2">
          <p className="text-sm text-green-700 font-medium">
            You are in this match as {myPlayer.position} (Team {myPlayer.team}).
          </p>
          {canLeave && (
            <button
              onClick={handleLeave}
              disabled={busy}
              className="w-full border border-red-300 text-red-600 hover:bg-red-50 rounded-xl py-3 disabled:opacity-60"
            >
              Leave match
            </button>
          )}
        </div>
      ) : joinable ? (
        <button
          onClick={handleJoin}
          disabled={busy || !selected}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl py-3 disabled:opacity-60"
        >
          {busy
            ? "Please wait..."
            : selected
              ? `Confirm ${selected.position} in Team ${selected.team}`
              : "Tap an open position"}
        </button>
      ) : (
        <p className="text-sm text-slate-500">This match is not open for joining.</p>
      )}

      {isOwner && joinable && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <h2 className="font-medium">Manage match</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-green-600"
              maxLength={200}
              placeholder="Match note"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
            />
            <button
              onClick={handleSaveNote}
              disabled={busy}
              className="border border-slate-300 rounded-xl px-4 hover:bg-slate-100 disabled:opacity-60"
            >
              Save
            </button>
          </div>
          <button
            onClick={handleCancel}
            disabled={busy}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 disabled:opacity-60"
          >
            Cancel match
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;