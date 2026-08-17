import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false); // 👈 የሞባይል ሜኑ ስቴት

  useEffect(() => {
    const isDark = localStorage.getItem("theme") !== "light";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 rounded-2xl shadow-lg mb-8 transition-colors duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>👋</span> {user.name}
          </h1>
          <p className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{user.university} <span className="text-gray-400 dark:text-slate-500">|</span> Role: <span className="uppercase tracking-wider font-semibold">{user.role}</span></p>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Dashboard</Link>
          <Link to="/groups" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Study Groups</Link>
          <Link to="/community" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Community</Link>
          <Link to="/profile" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Profile</Link>

          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition" title="Toggle Theme">
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button onClick={handleLogout} className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl hover:bg-rose-600 hover:text-white transition text-xs font-semibold shadow-sm">
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-sm">
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-700 dark:text-slate-200 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col space-y-3">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-slate-200">Dashboard</Link>
          <Link to="/groups" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-slate-200">Study Groups</Link>
          <Link to="/community" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-slate-200">Community</Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-slate-200">Profile</Link>
          <button onClick={handleLogout} className="w-full text-center bg-rose-500 text-white py-2 rounded-xl text-xs font-semibold">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}