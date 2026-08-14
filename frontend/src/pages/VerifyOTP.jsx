import React, { useState } from "react";
import API from "../api";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // ከ Register ገጽ የሚመጣው ኢሜይል (ካልመጣም ዩዘሩ በራሱ እንዲያስገባ text input እናደርጋለን)
  const [email, setEmail] = useState(location.state?.email || "");

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-3 rounded-2xl font-bold text-lg mb-3 shadow-lg">P2P</div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Verify Your Email</h2>
          <p className="text-slate-400 text-xs mt-1">
            Enter the 6-digit code sent to <span className="text-indigo-400 font-semibold">{email || "your email"}</span>
          </p>
        </div>

        {message && <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl text-center">{message}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          {!location.state?.email && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email</label>
              <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit OTP Code</label>
            <input type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" required className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-indigo-500" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg text-sm mt-2 disabled:opacity-50">
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
             {/* Back to Home Link */}
<div className="absolute top-6 left-6">
  <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
    ← Back to Home
  </Link>
</div>
        <p className="mt-6 text-xs text-center text-slate-400">
          Back to <Link to="/login" className="text-indigo-400 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}