import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const programs = ["BSCS", "BSAI", "BECE", "Other"];
const batches = ["2023", "2024", "2025", "2026"];
const input =
  "w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-green-600 bg-white";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    cmsId: "",
    batch: "",
    program: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup({ ...form, name: form.name.trim(), cmsId: form.cmsId.trim() });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <h1 className="font-display text-4xl tracking-wide text-green-700">Create account</h1>
        <p className="text-sm text-slate-500 mb-6">Use your university details</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className={input} placeholder="Full name" value={form.name} onChange={set("name")} />
          <input className={input} placeholder="CMS ID" value={form.cmsId} onChange={set("cmsId")} />
          <div className="grid grid-cols-2 gap-3">
            <select className={input} value={form.batch} onChange={set("batch")}>
              <option value="">Batch</option>
              {batches.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select className={input} value={form.program} onChange={set("program")}>
              <option value="">Program</option>
              {programs.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <input
            type="password"
            className={input}
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={set("password")}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={busy}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl py-3 disabled:opacity-60"
          >
            {busy ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-5 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-green-700 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}