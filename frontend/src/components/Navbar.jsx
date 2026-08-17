import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const isDark = localStorage.getItem("theme") === "dark";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 👈 የሞባይል ሜኑ ስቴት

  const toggleTheme = () => {
    if (isDark) {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    } else {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    }
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`w-full p-4 rounded-2xl shadow-lg mb-8 transition-colors duration-200 border ${
      isDark ? "bg-slate-900 text-white border-slate-800" : "bg-white text-gray-900 border-gray-200"
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <span>👋</span> {user.name}
          </h1>
          <p className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
            {user.university} <span className="text-gray-400">|</span> Role: <span className="uppercase tracking-wider font-semibold">{user.role}</span>
          </p>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
          <Link to="/groups" className="text-sm font-medium hover:underline">Study Groups</Link>
          <Link to="/community" className="text-sm font-medium hover:underline">Community</Link>
          <Link to="/profile" className="text-sm font-medium hover:underline">Profile</Link>

          {/* Theme Switcher */}
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-sm shadow-xs" title="Toggle Theme">
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button onClick={handleLogout} className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:bg-rose-600 transition">
            Logout
          </button>
        </div>

        {/* Mobile Menu & Theme Button */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-sm" title="Toggle Theme">
            {isDark ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-700 dark:text-slate-200 focus:outline-none">
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
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col space-y-3">
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Dashboard</Link>
          <Link to="/groups" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Study Groups</Link>
          <Link to="/community" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Community</Link>
          <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Profile</Link>
          <button onClick={handleLogout} className="w-full text-center bg-rose-500 text-white py-2 rounded-xl text-xs font-semibold">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}