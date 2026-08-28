import React, { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 👈 የኮንታክት ፎርም መላኪያ ትክክለኛው ሎጂክ
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: "General Inquiry",
        message: formData.message
      };

      const res = await API.post("/contact", payload);
      setSuccessMsg(res.data.message || "Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white overflow-x-hidden ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Navbar */}
      <nav className={`w-full border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-200 ${
        darkMode ? "bg-slate-950/90 border-slate-800/60" : "bg-white/90 border-gray-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-2.5 rounded-xl font-bold text-base shadow-md shadow-indigo-500/20">P2P</div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
              P2P <span className="text-indigo-600 dark:text-indigo-400">Learn</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-md font-medium">
            <Link to="/" className="text-indigo-600 dark:text-indigo-400 font-bold">Home</Link>
            <Link to="/how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">How It Works</Link>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition shadow-xs" title="Toggle Theme">
              {darkMode ? "☀️ Light Mode" : "🌙 Night Mode"}
            </button>
            <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-indigo-600 transition">Login</Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/30">Get Started</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-sm">
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b px-6 py-4 space-y-3 shadow-xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-indigo-600">Home</Link>
            <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium">How It Works</Link>
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold border rounded-lg">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg">Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
        <div className="relative z-10 text-center lg:text-left">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-6 ${
            darkMode ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"
          }`}>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Next-Gen Peer Learning Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Learn From Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Peers.</span> Share What You <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Know.</span>
          </h1>
          <p className={`mt-6 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
            Connect with university students who can teach what you want to master. Collaborate, chat in real-time, and build study groups effortlessly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link to="/register" className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 hover:opacity-95 transition text-center">
              Find a Learning Partner →
            </Link>
            <Link to="/register" className={`px-7 py-3.5 border font-semibold rounded-xl transition text-center ${
              darkMode ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs"
            }`}>
              Join Community
            </Link>
          </div>
        </div>

        {/* Hero Card Box */}
        <div className={`relative z-10 border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-center items-center text-center ${
          darkMode ? "bg-gradient-to-br from-slate-900 to-slate-900/80 border-slate-800" : "bg-white border-gray-200"
        }`}>
          <div className={`w-20 h-20 border rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner ${
            darkMode ? "bg-indigo-600/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"
          }`}>
            🚀
          </div>
          <h3 className="text-2xl font-bold mb-3">Collaborative Study Hub</h3>
          <p className={`text-sm max-w-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
            Real-time messaging, scheduled learning sessions, Q&A community forums, and intelligent skill-matching all in one place.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 w-full">
            <div className={`p-3 rounded-xl border ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-gray-50 border-gray-200"}`}>
              <span className="block text-indigo-600 dark:text-indigo-400 font-bold text-base sm:text-lg">100%</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Peer Driven</span>
            </div>
            <div className={`p-3 rounded-xl border ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-gray-50 border-gray-200"}`}>
              <span className="block text-purple-600 dark:text-purple-400 font-bold text-base sm:text-lg">Real-time</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Chat & Groups</span>
            </div>
            <div className={`p-3 rounded-xl border ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-gray-50 border-gray-200"}`}>
              <span className="block text-pink-600 dark:text-pink-400 font-bold text-base sm:text-lg">Smart</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Matching</span>
            </div>
          </div>
        </div>
      </section>

      {/* Get in Touch / Contact Section */}
      <section id="contact" className={`py-20 border-t ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-gray-200"}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">Get in Touch</span>
          <h2 className="text-3xl font-extrabold mt-4 mb-3 tracking-tight">Have Questions or Feedback?</h2>
          <p className="text-gray-400 text-sm mb-10 max-w-lg mx-auto">We'd love to hear from you. Send us a message and our team will get back to you shortly.</p>

          {/* Success / Error Banners */}
          {successMsg && <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl max-w-xl mx-auto font-semibold">{successMsg}</div>}
          {errorMsg && <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl max-w-xl mx-auto font-semibold">{errorMsg}</div>}

          <form onSubmit={handleContactSubmit} className="space-y-4 text-left max-w-xl mx-auto">
            <div>
              <label className="block text-xs font-semibold mb-1">Your Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Abebe Kassa" 
                required 
                className={`w-full p-3 border rounded-xl text-sm focus:outline-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com" 
                required 
                className={`w-full p-3 border rounded-xl text-sm focus:outline-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Message</label>
              <textarea 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..." 
                required 
                rows="4" 
                className={`w-full p-3 border rounded-xl text-sm focus:outline-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg text-sm disabled:opacity-50">
              {loading ? "Sending Message..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}