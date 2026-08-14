import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

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
    <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 rounded-2xl shadow-lg flex justify-between items-center mb-8 transition-colors duration-200">
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>👋</span> Welcome, {user.name}!
        </h1>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">{user.university} <span className="text-gray-400 dark:text-slate-500">|</span> Role: <span className="uppercase tracking-wider font-semibold">{user.role}</span></p>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Dashboard</Link>
        <Link to="/groups" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Study Groups</Link>
        <Link to="/community" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Community</Link>
        <Link to="/profile" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Profile</Link>

        {/* 🌙 / ☀️ Theme Switcher Button */}
        <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition" title="Toggle Theme">
          {darkMode ? "☀️" : "🌙"}
        </button>

        <button onClick={handleLogout} className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl hover:bg-rose-600 hover:text-white transition text-xs font-semibold shadow-sm">
          Logout
        </button>
      </div>
    </div>
  );
}