import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer"; // 👈 ፉተሩን ማስገባት

export default function HowItWorks() {
  const [darkMode, setDarkMode] = useState(true);

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

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Navbar */}
      <nav className={`w-full border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-200 ${darkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-2.5 rounded-xl font-bold text-base shadow-md">P2Pl</div>
            <span className="text-xl font-extrabold tracking-tight">P2P <span className="text-indigo-500">Learn</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="hover:text-indigo-500 transition">Home</Link>
            <Link to="/how-it-works" className="text-indigo-500 font-semibold">How It Works</Link>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-200 dark:bg-slate-800 text-sm shadow-xs" title="Toggle Theme">
              {darkMode ? "☀️" : "🌙"}
            </button>
            <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-indigo-500 transition">Login</Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">Step-by-Step Guide</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4 tracking-tight">How P2P Learn Works</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">Discover how students connect, teach each other, collaborate in study groups, and grow together seamlessly.</p>
        </div>

        <div className="space-y-12">
          {/* Step 1 */}
          <div className={`p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row gap-8 items-center ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-extrabold text-2xl shrink-0">01</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Create Your Student Profile</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Sign up using your real email address and verify it with the secure OTP code. Set up your student profile by adding your university details and a short bio about yourself.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row gap-8 items-center ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-extrabold text-2xl shrink-0">02</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Define Your Skills (Teach & Learn)</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Specify the topics and programming languages you excel at and can teach to others (e.g., React, JavaScript), as well as the skills you are eager to learn (e.g., Node.js, MongoDB).</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row gap-8 items-center ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            <div className="w-16 h-16 rounded-2xl bg-pink-600/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-extrabold text-2xl shrink-0">03</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Find Partners & Send Requests</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Search through active learners using our skill-matching system. Send learning requests to peers, accept or reject incoming requests, and schedule live learning sessions.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className={`p-8 rounded-3xl border shadow-xl flex flex-col md:flex-row gap-8 items-center ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-2xl shrink-0">04</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Chat, Join Groups & Community Q&A</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Engage in real-time 1-to-1 or Study Group chats (complete with Telegram-style 'seen' checkmarks and file/image uploads). Post questions on the community forum and get answers from fellow students!</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {/* Call to Action with Back to Home & Get Started */}
        <div className="mt-16 text-center bg-gradient-to-r from-indigo-600 to-purple-600 p-10 rounded-3xl text-white shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Ready to Start Learning?</h2>
          <p className="text-indigo-100 text-sm mb-6 max-w-xl mx-auto">Join our growing community of students and take your technical skills to the next level.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="px-8 py-3.5 bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold rounded-xl shadow-lg border border-white/20 transition">
              ← Back to Home
            </Link>
            <Link to="/register" className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition">
              Get Started Now →
            </Link>
          </div>
        </div>
      </div>

      {/* 👈 Footer እዚህ ጋር ተካቷል */}
      <Footer />
    </div>
  );
}