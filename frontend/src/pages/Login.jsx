import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative text-slate-900">
      
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6 flex justify-start">
        <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
          ← Back to Home
        </Link>
      </div>

      <div className="max-w-md w-full bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl shadow-slate-200/50 relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-3 rounded-2xl font-bold text-lg mb-3 shadow-md shadow-indigo-600/20">P2P</Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-xs mt-1">Sign in to continue to P2P Learn</p>
        </div>

        {error && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-indigo-600 hover:underline font-medium">Forgot password?</Link>
            </div>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-md shadow-indigo-600/20 text-sm mt-2 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-xs text-center text-slate-500">
          Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}