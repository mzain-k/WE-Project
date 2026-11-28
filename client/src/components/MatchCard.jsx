import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import {
  formatDateParts,
  formatHour,
} from "../utils/dateTime";

const MatchCard = ({ match }) => {
  const parts = formatDateParts(match.date);
  const cancelled = match.status === "cancelled";
  const className = "block bg-white border border-slate-200 rounded-2xl p-4";

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-2xl tracking-wide">
            {formatHour(match.slotStart)} - {formatHour(match.slotStart + 1)}
          </p>
          <p className="text-sm text-slate-500">
            {parts.weekday}, {parts.day} {parts.month}
          </p>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <p className="text-sm text-slate-500 mt-2">Posted by {match.createdBy}</p>

      <div className="flex gap-4 mt-3 text-sm font-medium">
        <span className="text-green-800">Team A: {match.teamACount}/6</span>
        <span className="text-blue-700">Team B: {match.teamBCount}/6</span>
      </div>

      {match.role && (
        <p className="text-xs text-green-700 font-medium mt-2">
          {match.role === "poster" ? "You posted this match" : "You are playing"}
          {match.myPlayer &&
            ` · Team ${match.myPlayer.team}, ${match.myPlayer.position}`}
        </p>
      )}

      {match.note && (
        <p className="text-sm text-slate-500 mt-2 truncate">{match.note}</p>
      )}
    </>
  );

  if (cancelled) {
    return <div className={`${className} opacity-70`}>{content}</div>;
  }

  return (
    <Link
      to={`/matches/${match._id}`}
      className={`${className} hover:border-green-600 transition`}
    >
      {content}
    </Link>
  );
};

export default MatchCard;