import React, { useState } from "react";
import API from "../api";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams(); // ከ URL ላይ ቶከኑን መቀበል
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      alert(res.data.message || "Password updated successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-3 rounded-2xl font-bold text-lg mb-3 shadow-lg">P2P</Link>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h2>
          <p className="text-slate-400 text-xs mt-1">Enter your new secure password below</p>
        </div>

        {error && <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl text-center">{error}</div>}
        {message && <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg text-sm mt-2 disabled:opacity-50">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}