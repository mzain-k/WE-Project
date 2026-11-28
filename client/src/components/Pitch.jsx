import {
  MAIN_POSITIONS,
  RESERVE_POSITIONS,
} from "../utils/constants";

const FORMATION = {
  GK: {
    x: 45,
    y: 150,
  },
  DF1: {
    x: 115,
    y: 95,
  },
  DF2: {
    x: 115,
    y: 205,
  },
  MD1: {
    x: 190,
    y: 85,
  },
  MD2: {
    x: 190,
    y: 215,
  },
  FW: {
    x: 245,
    y: 150,
  },
};

const TEAM_COLORS = {
  A: "#14532D",
  B: "#2563EB",
};

const MINE_COLOR = "#FACC15";

const getInitials = (name) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
};

const getPoint = (team, position, vertical) => {
  const base = FORMATION[position];
  const x = team === "A" ? base.x : 600 - base.x;

  if (vertical) {
    return {
      x: base.y,
      y: x,
    };
  }

  return {
    x,
    y: base.y,
  };
};

const getSlotInfo = ({ players, team, position, myCmsId, selected, closed, locked }) => {
  const player = players.find((item) => {
    return item.team === team && item.position === position;
  });

  if (player) {
    const mine = player.cmsId === myCmsId;

    return {
      kind: mine ? "mine" : "taken",
      label: mine ? "You" : getInitials(player.name),
      fill: mine ? MINE_COLOR : TEAM_COLORS[team],
      text: mine ? "#422006" : "#FFFFFF",
      joinable: false,
      title: `${player.name} (${player.cmsId})`,
    };
  }

  const isSelected = selected?.team === team && selected?.position === position;
  const joinable = !locked && !closed[team];

  return {
    kind: isSelected ? "selected" : "empty",
    label: position,
    fill: isSelected ? "#FFFFFF" : "none",
    text: isSelected ? "#166534" : "#FFFFFF",
    joinable,
    title: joinable ? `Join ${position} in Team ${team}` : "Not available",
  };
};

const PitchSvg = ({ vertical, className, ...shared }) => {
  const lineColor = "#DCFCE7";

  return (
    <svg
      viewBox={vertical ? "0 0 300 600" : "0 0 600 300"}
      className={className}
      role="img"
    >
      <title>Futsal pitch</title>
      <rect
        x="0"
        y="0"
        width={vertical ? 300 : 600}
        height={vertical ? 600 : 300}
        rx="12"
        fill="#16A34A"
      />
      <rect
        x="10"
        y="10"
        width={vertical ? 280 : 580}
        height={vertical ? 580 : 280}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
      />
      <line
        x1={vertical ? 10 : 300}
        y1={vertical ? 300 : 10}
        x2={vertical ? 290 : 300}
        y2={vertical ? 300 : 290}
        stroke={lineColor}
        strokeWidth="2"
      />
      <circle
        cx={vertical ? 150 : 300}
        cy={vertical ? 300 : 150}
        r="40"
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
      />
      <rect
        x={vertical ? 95 : 10}
        y={vertical ? 10 : 95}
        width={vertical ? 110 : 45}
        height={vertical ? 45 : 110}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
      />
      <rect
        x={vertical ? 95 : 545}
        y={vertical ? 545 : 95}
        width={vertical ? 110 : 45}
        height={vertical ? 45 : 110}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
      />

      {["A", "B"].flatMap((team) => {
        return MAIN_POSITIONS.map((position) => {
          const point = getPoint(team, position, vertical);
          const info = getSlotInfo({
            ...shared,
            team,
            position,
          });

          return (
            <g
              key={`${team}-${position}`}
              onClick={info.joinable ? () => shared.onSelect(team, position) : undefined}
              className={info.joinable ? "cursor-pointer" : ""}
            >
              <title>{info.title}</title>
              <circle
                cx={point.x}
                cy={point.y}
                r="20"
                fill={info.fill}
                stroke={info.fill === "none" || info.kind === "selected" ? "#FFFFFF" : "none"}
                strokeWidth="1.5"
                strokeDasharray={info.kind === "empty" ? "4 4" : undefined}
                opacity={info.kind === "empty" && !info.joinable ? 0.5 : 1}
                pointerEvents="all"
              />
              <text
                x={point.x}
                y={point.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill={info.text}
                pointerEvents="none"
              >
                {info.label}
              </text>
            </g>
          );
        });
      })}
    </svg>
  );
};

const Bench = ({ team, ...shared }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-slate-500">
      <span>Team {team} reserves</span>

      {RESERVE_POSITIONS.map((position) => {
        const info = getSlotInfo({
          ...shared,
          team,
          position,
        });
        const filled = info.kind === "taken" || info.kind === "mine";
        const emptyClass =
          info.kind === "selected"
            ? "border-green-600 bg-green-50 text-green-700"
            : `border-dashed border-slate-400 text-slate-500 ${info.joinable ? "" : "opacity-50"}`;

        return (
          <button
            key={position}
            type="button"
            title={info.title}
            disabled={!info.joinable}
            onClick={() => shared.onSelect(team, position)}
            style={
              filled
                ? {
                    backgroundColor: info.fill,
                    color: info.text,
                    borderColor: info.fill,
                  }
                : undefined
            }
            className={`w-11 h-11 rounded-full border text-xs font-medium ${filled ? "" : emptyClass}`}
          >
            {info.label}
          </button>
        );
      })}
    </div>
  );
};

const Pitch = ({ players, closed, selected, onSelect, myCmsId, locked }) => {
  const shared = {
    players,
    closed,
    selected,
    onSelect,
    myCmsId,
    locked,
  };

  return (
    <div>
      <PitchSvg
        vertical={false}
        className="hidden sm:block w-full"
        {...shared}
      />
      <PitchSvg
        vertical
        className="block sm:hidden w-full max-w-sm mx-auto"
        {...shared}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <Bench team="A" {...shared} />
        <Bench team="B" {...shared} />
      </div>
    </div>
  );
};

export default Pitch;