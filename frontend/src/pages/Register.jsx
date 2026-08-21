import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    university: "",
    skillsToTeach: "",
    skillsToLearn: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skillsToTeach: formData.skillsToTeach.split(",").map((s) => s.trim()).filter(Boolean),
        skillsToLearn: formData.skillsToLearn.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await API.post("/auth/register", payload);
      alert(res.data.message);
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 text-slate-900">
      
      {/* Back to Home Link */}
      <div className="w-full max-w-lg mb-6 flex justify-start">
        <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
          ← Back to Home
        </Link>
      </div>

      <div className="max-w-lg w-full bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl shadow-slate-200/50 relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-3 rounded-2xl font-bold text-lg mb-3 shadow-md shadow-indigo-600/20">P2P</Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-xs mt-1">Join the peer-to-peer learning network</p>
        </div>

        {error && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input type="text" name="name" placeholder="Abebe Kassa" onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">University</label>
              <input type="text" name="university" placeholder="Wollo University" onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input type="email" name="email" placeholder="name@example.com" onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skills to Teach (comma separated)</label>
            <input type="text" name="skillsToTeach" placeholder="React, JavaScript" onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skills to Learn (comma separated)</label>
            <input type="text" name="skillsToLearn" placeholder="Node.js, MongoDB" onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-md shadow-indigo-600/20 text-sm mt-4 disabled:opacity-50">
            {loading ? "Registering..." : "Continue to Verification"}
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-slate-500">
          Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}