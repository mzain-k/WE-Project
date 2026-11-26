import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl text-green-700">Welcome, {user.name}</h1>
      <p className="text-slate-500">{user.program} · Batch {user.batch} · {user.cmsId}</p>
      <button
        onClick={logout}
        className="mt-4 border border-slate-300 rounded-xl px-4 py-2 hover:bg-slate-100"
      >
        Log out
      </button>
    </div>
  );
}