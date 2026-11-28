import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import MatchCard from "../components/MatchCard";

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/matches/mine")
      .then((res) => setMatches(res.data.matches))
      .catch(() => setError("Could not load your matches"))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = matches.filter((match) => {
    return ["open", "full"].includes(match.status);
  });
  const past = matches
    .filter((match) => {
      return !["open", "full"].includes(match.status);
    })
    .reverse();
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <Link to="/" className="text-sm text-green-700 font-medium">
        &larr; Home
      </Link>

      <h1 className="font-display text-4xl tracking-wide text-green-700">
        My matches
      </h1>

      <div className="grid grid-cols-2 gap-3 max-w-sm">
        {["upcoming", "past"].map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`rounded-xl border py-2 capitalize ${
              tab === name
                ? "bg-green-600 text-white border-green-600"
                : "bg-white border-slate-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-slate-500">Nothing here yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMatches;