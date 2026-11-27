import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import MatchCard from "../components/MatchCard";
import {
  getNextDates,
  formatDateParts,
} from "../utils/dateTime";

const dates = getNextDates(14);

const Home = () => {
  const { user, logout } = useAuth();
  const [date, setDate] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get("/matches", {
        params: {
          date: date || undefined,
          open: openOnly ? "true" : undefined,
        },
      })
      .then((res) => setMatches(res.data.matches))
      .catch(() => setError("Could not load matches"))
      .finally(() => setLoading(false));
  }, [date, openOnly]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-green-700">
            Futsal Hub
          </h1>
          <p className="text-sm text-slate-500">Hi, {user.name}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/new-booking"
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-medium"
          >
            New booking
          </Link>
          <button
            onClick={logout}
            className="border border-slate-300 rounded-xl px-4 py-2 text-sm hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setDate("")}
          className={`shrink-0 w-16 rounded-xl border py-2 text-center ${
            date === ""
              ? "bg-green-600 text-white border-green-600"
              : "bg-white border-slate-300"
          }`}
        >
          <div className="text-lg font-semibold">All</div>
          <div className="text-xs">dates</div>
        </button>

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

      <button
        role="switch"
        aria-checked={openOnly}
        onClick={() => setOpenOnly(!openOnly)}
        className="flex items-center gap-3 text-sm"
      >
        <span
          className={`w-11 h-6 rounded-full p-0.5 transition ${
            openOnly ? "bg-green-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white transition ${
              openOnly ? "translate-x-5" : ""
            }`}
          />
        </span>
        Open matches only
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : matches.length === 0 ? (
        <p className="text-slate-500">No matches found.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;