import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [cmsId, setCmsId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(cmsId.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <h1 className="font-display text-4xl tracking-wide text-green-700">Futsal Hub</h1>
        <p className="text-sm text-slate-500 mb-6">Log in to find or post a match</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-green-600"
            placeholder="CMS ID"
            value={cmsId}
            onChange={(e) => setCmsId(e.target.value)}
          />
          <input
            type="password"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-green-600"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={busy}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl py-3 disabled:opacity-60"
          >
            {busy ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-5 text-center">
          New here?{" "}
          <Link to="/signup" className="text-green-700 font-medium">Create account</Link>
        </p>
      </div>
    </div>
  );
}