import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [darkMode, setDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = localStorage.getItem("theme") !== "light";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  };

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
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 relative transition-colors duration-200 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Back to Home Link & Theme Toggle */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">
        <Link to="/" className={`text-xs font-semibold flex items-center gap-1.5 transition px-4 py-2 rounded-xl shadow-xs border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600"}`}>
          ← Back to Home
        </Link>
        <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-200 dark:bg-slate-800 text-sm shadow-xs border border-gray-300 dark:border-slate-700" title="Toggle Theme">
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <div className={`max-w-md w-full border p-8 rounded-3xl shadow-2xl relative transition-colors duration-200 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80 shadow-xl shadow-slate-200/50"}`}>
        <div className="text-center mb-8">
          <Link to="/" className={`inline-block p-3 rounded-2xl font-bold text-lg mb-3 shadow-lg ${darkMode ? "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-indigo-500/20" : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20"}`}>P2P</Link>
          <h2 className={`text-2xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>Welcome Back</h2>
          <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Sign in to continue to P2P Learn</p>
        </div>

        {error && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Email Address</label>
            <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition ${darkMode ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500" : "bg-slate-50/50 border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white"}`} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={`block text-xs font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Password</label>
              <Link to="/forgot-password" className={`text-[11px] hover:underline font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>Forgot password?</Link>
            </div>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition ${darkMode ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500" : "bg-slate-50/50 border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white"}`} />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3.5 font-semibold rounded-xl transition shadow-md text-sm mt-2 disabled:opacity-50 ${darkMode ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"}`}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={`mt-8 text-xs text-center ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Don't have an account? <Link to="/register" className={`font-semibold hover:underline ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>Register</Link>
        </p>
      </div>
    </div>
  );
}