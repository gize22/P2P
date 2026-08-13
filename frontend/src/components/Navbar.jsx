import React from "react";
import { useNavigate, Link } from "react-router-dom"; // Link አስገባን

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (   
    <div className="max-w-5xl mx-auto bg-white p-4 rounded-lg shadow flex justify-between items-center mb-6">
      <div>
        <h1 className="text-xl font-bold text-indigo-600">Welcome, {user.name}!</h1>
        <p className="text-sm text-gray-500">{user.university} | Role: {user.role}</p>
      </div>

      {/* 👈 የገጾች ማቀያየሪያ ሊንኮች */}
      <div className="flex items-center gap-4">
        <Link to="/community" className="text-sm font-semibold text-gray-600 hover:text-indigo-600">Community</Link>
        <Link to="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-indigo-600">Dashboard</Link>
        <Link to="/groups" className="text-sm font-semibold text-gray-600 hover:text-indigo-600">Study Groups</Link>
        <Link to="/profile" className="text-sm font-semibold text-gray-600 hover:text-indigo-600">Profile</Link>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
          Logout
        </button>
      </div>
    </div>
  );
}