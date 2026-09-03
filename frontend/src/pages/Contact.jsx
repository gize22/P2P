import React, { useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  // DarkMode በዲፎልት true እንዲሆን (ወይም ከ App state ከፈለጉ መቀየር ይችላሉ)
  const [darkMode, setDarkMode] = useState(true);

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
    <div className={`min-h-screen flex flex-col justify-between ${darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"}`}>
      
      {/* Top Navigation / Back to Home Header */}
      <div className="max-w-6xl w-full mx-auto px-6 pt-6 flex justify-between items-center">
        <Link to="/" className="inline-block bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-2.5 rounded-2xl font-bold text-base shadow-lg shadow-indigo-500/20">
          P2P
        </Link>
        <Link to="/" className={`text-xs font-semibold flex items-center gap-1.5 transition px-4 py-2 rounded-xl shadow-md border ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white" : "bg-gray-100 border-gray-200 text-gray-700 hover:text-black"}`}>
          ← Back to Home
        </Link>
      </div>

      {/* Get in Touch / Contact Section (የሰጡኝ ዲዛይን 100% ያልተነካ) */}
      <section id="contact" className={`py-16 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"}`}>
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">
              Get in Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-3 tracking-tight">Have Questions or Feedback?</h2>
            <p className="text-gray-400 text-sm">We'd love to hear from you. Send us a message and our team will get back to you shortly.</p>
          </div>

          {/* 2-Column Grid Layout (Left: Info, Right: Form) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Box: Contact Information */}
            <div className={`lg:col-span-5 p-8 rounded-3xl border shadow-xl ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-200 text-gray-800"}`}>
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <p className="text-xs text-gray-400 mb-8 leading-relaxed">
                Feel free to reach out to us through any of the channels below, or fill out the form and we'll get back to you as soon as possible.
              </p>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    📍
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Our Address</p>
                    <p className="font-semibold mt-0.5">Tulu Awuliya, Ethiopia</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    📧
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Email Us</p>
                    <p className="font-semibold mt-0.5">gizachewkassa22@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    📞
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Call Us</p>
                    <p className="font-semibold mt-0.5">+251 957837318</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Form */}
            <div className={`lg:col-span-7 p-8 rounded-3xl border shadow-xl ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-gray-200 text-gray-800"}`}>
              
              {/* Success / Error Banners */}
              {successMsg && <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl font-semibold text-center">{successMsg}</div>}
              {errorMsg && <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl font-semibold text-center">{errorMsg}</div>}

              <form onSubmit={handleContactSubmit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-gray-300">Your Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Gizachew Kassa" 
                      required 
                      className={`w-full p-3.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-gray-300">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="gizachew@gmail.com" 
                      required 
                      className={`w-full p-3.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-300">Message</label>
                  <textarea 
                    name="message" 
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..." 
                    required 
                    rows="4" 
                    className={`w-full p-3.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition resize-none ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} 
                  />
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm disabled:opacity-50">
                  {loading ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className={`py-6 border-t text-center text-xs ${darkMode ? "bg-slate-950 border-slate-800 text-slate-500" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
        © {new Date().getFullYear()} P2P Learn. All rights reserved.
      </footer>

    </div>
  );
}