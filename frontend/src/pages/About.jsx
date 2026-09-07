import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function About() {
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
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-2.5 rounded-xl font-bold text-base shadow-md">P2P</div>
            <span className="text-xl font-extrabold tracking-tight">P2P <span className="text-indigo-500">Learn</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="hover:text-indigo-500 transition">Home</Link>
            <Link to="/how-it-works" className="hover:text-indigo-500 transition">How It Works</Link>
            <Link to="/about" className="text-indigo-500 font-semibold">About Us</Link>
            <Link to="/contact" className="hover:text-indigo-500 transition">Contact Us</Link>
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
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">About Our Platform</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4 tracking-tight">Empowering Students Through Peer Learning</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">P2P Learn bridges the gap between university students by creating a collaborative environment to share knowledge, master new skills, and grow together.</p>
        </div>

        <div className="space-y-12">
          {/* Mission Section */}
          <div className={`p-8 rounded-3xl border shadow-xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            <h3 className="text-2xl font-bold mb-3 text-indigo-400">Our Mission</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
               We aim to transform traditional isolated studying into an interactive, community-driven experience. By matching students based on their specific skillsets and academic objectives, we empower them to teach what they master and learn what they desire in real-time.
            </p>
          </div>

          {/* Why Choose Us */}
          <div className={`p-8 rounded-3xl border shadow-xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            <h3 className="text-2xl font-bold mb-4 text-purple-400">Why P2P Learn?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-bold mb-1 text-white">✨ Smart Skill Matching</h4>
                <p className="text-gray-400 text-xs">Find peers who want to learn what you can teach, and vice-versa.</p>
              </div>
              <div>
                <h4 className="font-bold mb-1 text-white">💬 Real-Time Collaboration</h4>
                <p className="text-gray-400 text-xs"> Engage in instant 1-on-1 chats, study group discussions, and file sharing securely.</p>
              </div>
              <div>
                <h4 className="font-bold mb-1 text-white">⭐ Trusted Feedback</h4>
                <p className="text-gray-400 text-xs">Rate and review learning sessions to maintain high-quality guidance.</p>
              </div>
              <div>
                <h4 className="font-bold mb-1 text-white">🔒 Secure & Reliable</h4>
                <p className="text-gray-400 text-xs">Verified accounts with email OTP ,Enjoy peace of mind with encrypted passwords and  robust administrative oversight.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-indigo-600 to-purple-600 p-10 rounded-3xl text-white shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Join Our Community Today</h2>
          <p className="text-indigo-100 text-sm mb-6 max-w-xl mx-auto">Start sharing your expertise and learning new technologies with peers from your university.</p>
          <Link to="/register" className="inline-block px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition">
            Get Started Now →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}