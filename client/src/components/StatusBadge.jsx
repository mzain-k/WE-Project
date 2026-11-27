const STYLES = {
  open: "bg-green-100 text-green-800",
  full: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-slate-200 text-slate-600",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`text-xs font-medium capitalize px-3 py-1 rounded-lg ${STYLES[status] || STYLES.cancelled}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;