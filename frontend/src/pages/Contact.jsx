import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Footer from "../components/Footer"; // 👈 ፉተሩን ከ HowItWorks ጋር በሚመሳሰል መልኩ ማካተት

export default function Contact() {
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await API.post("/contact", formData);
      setSuccessMsg(res.data.message || "Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Navbar (ልክ እንደ HowItWorks) */}
      <nav className={`w-full border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-200 ${darkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-2.5 rounded-xl font-bold text-base shadow-md">P2P</div>
            <span className="text-xl font-extrabold tracking-tight">P2P <span className="text-indigo-500">Learn</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="hover:text-indigo-500 transition">Home</Link>
            <Link to="/how-it-works" className="hover:text-indigo-500 transition">How It Works</Link>
            <Link to="/contact" className="text-indigo-500 font-semibold">Contact Us</Link>
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

      {/* Main Contact Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-4 tracking-tight">Have Questions or Feedback?</h1>
          <p className="text-gray-400 text-sm">We'd love to hear from you. Send us a message and our team will get back to you shortly.</p>
        </div>

        {/* 2-Column Grid Layout (Left: Info, Right: Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Box: Contact Information */}
          <div className={`lg:col-span-5 p-8 rounded-3xl border shadow-xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Feel free to reach out to us through any of the channels below, or fill out the form and we'll get back to you as soon as possible.
            </p>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">📍</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Our Address</p>
                  <p className="font-semibold mt-0.5">Tulu Awuliya, Ethiopia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">📧</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email Us</p>
                  <p className="font-semibold mt-0.5">gizachewkassa22@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">📞</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Call Us</p>
                  <p className="font-semibold mt-0.5">+251 957837318</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Box: Form */}
          <div className={`lg:col-span-7 p-8 rounded-3xl border shadow-xl ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            
            {successMsg && <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl font-semibold text-center">{successMsg}</div>}
            {errorMsg && <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl font-semibold text-center">{errorMsg}</div>}

            <form onSubmit={handleContactSubmit} className="space-y-5 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Your Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Gizachew Kassa" 
                    required 
                    className={`w-full p-3.5 border rounded-xl text-sm focus:outline-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="gizachew@gmail.com" 
                    required 
                    className={`w-full p-3.5 border rounded-xl text-sm focus:outline-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Message</label>
                <textarea 
                  name="message" 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..." 
                  required 
                  rows="4" 
                  className={`w-full p-3.5 border rounded-xl text-sm focus:outline-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
                />
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg text-sm disabled:opacity-50">
                {loading ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}