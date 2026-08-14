import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, totalQuestions: 0 });
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    // አድሚን መሆኑን ማረጋገጥ
    if (parsedUser.role !== "admin") {
      alert("Access denied! Admins only.");
      navigate("/dashboard");
      return;
    }
    setUser(parsedUser);
    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const statsRes = await API.get("/admin/stats");
      setStats(statsRes.data);

      const usersRes = await API.get("/admin/users");
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/admin/users/${id}`);
        alert("User deleted successfully");
        fetchAdminData();
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            🛡️ Admin Control Panel
          </h1>
          <p className="text-xs text-indigo-400 mt-0.5">Logged in as Administrator: {user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition">User Dashboard</Link>
          <button onClick={handleLogout} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition text-xs font-semibold">
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
          <h3 className="text-3xl font-extrabold text-white mt-2">{stats.totalUsers}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Groups</p>
          <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">{stats.totalGroups}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Community Questions</p>
          <h3 className="text-3xl font-extrabold text-purple-400 mt-2">{stats.totalQuestions}</h3>
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden p-6">
        <h2 className="text-lg font-bold text-white mb-4">Manage Platform Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">University</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                  <td className="py-3 px-4 text-slate-300">{u.email}</td>
                  <td className="py-3 px-4 text-slate-400">{u.university}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u._id)} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-lg text-xs hover:bg-rose-500 hover:text-white transition">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}