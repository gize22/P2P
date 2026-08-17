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

      // 👈 Real-world Role-based Routing (እንደ ዩሰሩ ሮል መርጦ መውሰድ)
      if (res.data.user.role === "admin") {
        navigate("/admin"); // አድሚን ከሆነ ወደ አድሚን ፓነል
      } else {
        navigate("/dashboard"); // ተማሪ ከሆነ ወደ መደበኛ ዳሽቦርድ
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-block bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-3 rounded-2xl font-bold text-lg mb-3 shadow-lg shadow-indigo-500/20">P2P</Link>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in to continue to P2P Learn</p>
        </div>

        {error && <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              {/* <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">Forgot password?</Link> */}
            </div>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm mt-2 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:underline">Forgot password?</Link>
        </form>
       {/* Back to Home Link */}
<div className="absolute top-6 left-6">
  <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
    ← Back to Home
  </Link>
  
</div>
        <p className="mt-8 text-xs text-center text-slate-400">
          Don't have an account? <Link to="/register" className="text-indigo-400 font-semibold hover:underline">Register</Link>
          
        </p>
      </div>
    </div>
  );
}