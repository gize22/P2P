import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext"; // 👈 ከግሎባል ቴም ጋር ማያያዝ

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme(); // 👈 ግሎባል ቴም ሆክ
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  // 👈 ሪል-ወልድ ራስ-ሰር የከለር መቀያየሪያ ለ Navbar (በሁለቱም ሞዶች ጥርት ብሎ ይታያል)
  const navbarBg = isDark 
    ? "bg-slate-900 border-slate-800 text-white shadow-xl" 
    : "bg-white border-gray-200 text-gray-900 shadow-lg";

  const activeStyle = "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30";
  const inactiveStyle = isDark 
    ? "text-slate-300 font-semibold hover:text-white hover:bg-slate-800" 
    : "text-gray-700 font-semibold hover:text-indigo-600 hover:bg-gray-100";

  return (
    <div className={`max-w-6xl mx-auto p-4 rounded-2xl mb-8 transition-colors duration-200 border ${navbarBg}`}>
      <div className="flex justify-between items-center">
        
        {/* Profile Avatar & User Info */}
        <div className="flex items-center gap-3">
          {/* 👈 ልክ በፎቶው ላይ ያለው ንጹህ ግራጫ ዩሰር አዶ (👤) */}
          <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700 shadow-xs">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
              {user.name}
            </h1>
            <p className="text-[11px] sm:text-xs text-indigo-400 mt-0.5">
              {user.university} <span className="text-gray-400">|</span> Role: <span className="uppercase tracking-wider font-semibold">{user.role}</span>
            </p>
          </div>
        </div>

        {/* Desktop Links with Active Highlight */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/dashboard" className={`px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard') ? activeStyle : inactiveStyle}`}>Dashboard</Link>
          <Link to="/groups" className={`px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/groups') ? activeStyle : inactiveStyle}`}>Study Groups</Link>
          <Link to="/community" className={`px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/community') ? activeStyle : inactiveStyle}`}>Community</Link>
          <Link to="/profile" className={`px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/profile') ? activeStyle : inactiveStyle}`}>Profile</Link>

          <div className="h-6 w-[1px] bg-gray-300 dark:bg-slate-800 mx-1"></div>

          {/* Theme Switcher Button */}
          <button onClick={toggleTheme} className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition" title="Toggle Theme">
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button onClick={handleLogout} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-rose-500/20">
            Logout
          </button>
        </div>

        {/* Mobile Menu & Theme Button */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-yellow-400">
            {isDark ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className={`md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col space-y-2`}>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-xl text-sm ${isActive('/dashboard') ? activeStyle : inactiveStyle}`}>Dashboard</Link>
          <Link to="/groups" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-xl text-sm ${isActive('/groups') ? activeStyle : inactiveStyle}`}>Study Groups</Link>
          <Link to="/community" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-xl text-sm ${isActive('/community') ? activeStyle : inactiveStyle}`}>Community</Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-xl text-sm ${isActive('/profile') ? activeStyle : inactiveStyle}`}>Profile</Link>
          
          <button onClick={handleLogout} className="w-full text-center bg-rose-500 text-white py-2.5 rounded-xl text-xs font-semibold mt-2 shadow-sm">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}