import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, totalQuestions: 0 });
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // "users" | "groups" | "chats" | "questions" | "reviews"
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "admin") {
      alert("Access denied! Admins only.");
      navigate("/dashboard");
      return;
    }
    setUser(parsedUser);
    fetchAllAdminData();
  }, [navigate]);

  const fetchAllAdminData = async () => {
    try {
      const statsRes = await API.get("/admin/stats");
      setStats(statsRes.data);

      const usersRes = await API.get("/admin/users");
      setUsers(usersRes.data);

      const groupsRes = await API.get("/admin/groups");
      setGroups(groupsRes.data);

      const msgRes = await API.get("/admin/messages");
      setMessages(msgRes.data);

      const qRes = await API.get("/admin/questions");
      setQuestions(qRes.data);

      const revRes = await API.get("/admin/reviews");
      setReviews(revRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Delete this user?")) {
      try {
        await API.delete(`/admin/users/${id}`);
        alert("User deleted");
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleMakeAdmin = async (id) => {
    if (window.confirm("Promote user to Admin?")) {
      try {
        await API.put(`/admin/promote/${id}`);
        alert("Promoted to Admin!");
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to promote");
      }
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm("Delete this group and all its messages?")) {
      try {
        await API.delete(`/admin/groups/${id}`);
        alert("Group deleted");
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to delete group");
      }
    }
  };

  const handleRemoveMember = async (groupId, userId) => {
    if (window.confirm("Remove this member from the group?")) {
      try {
        await API.put(`/admin/groups/${groupId}/remove-member`, { userId });
        alert("Member removed from group");
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to remove member");
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Delete this message/file?")) {
      try {
        await API.delete(`/admin/messages/${id}`);
        alert("Message deleted");
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to delete message");
      }
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Delete this community question?")) {
      try {
        await API.delete(`/admin/questions/${id}`);
        alert("Question deleted");
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to delete question");
      }
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Delete this review?")) {
      try {
        await API.delete(`/admin/reviews/${id}`);
        alert("Review deleted");
        fetchAllAdminData();
      } catch (err) {
        alert("Failed to delete review");
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
          <p className="text-xs text-indigo-400 mt-0.5">Administrator: {user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition">User Dashboard</Link> */}
          <button onClick={handleLogout} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition text-xs font-semibold">
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
          <h3 className="text-3xl font-extrabold text-white mt-2">{users.length}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Groups</p>
          <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">{groups.length}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Community Questions</p>
          <h3 className="text-3xl font-extrabold text-purple-400 mt-2">{questions.length}</h3>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-6xl mx-auto flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
        <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
          👥 Users ({users.length})
        </button>
        <button onClick={() => setActiveTab("groups")} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'groups' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
          📚 Groups & Members ({groups.length})
        </button>
        <button onClick={() => setActiveTab("chats")} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'chats' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
          💬 Group Chats & Files ({messages.length})
        </button>
        <button onClick={() => setActiveTab("questions")} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'questions' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
          ❓ Community Q&A ({questions.length})
        </button>
        <button onClick={() => setActiveTab("reviews")} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'reviews' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
          ⭐ Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === "users" && (
        <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Manage Platform Users</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-white font-semibold">{u.name}</td>
                  <td className="py-3 px-4 text-slate-300">{u.email}</td>
                  <td className="py-3 px-4"><span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full">{u.role}</span></td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    {u.role !== 'admin' && (
                      <>
                        <button onClick={() => handleMakeAdmin(u._id)} className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs hover:bg-purple-500 hover:text-white">Make Admin</button>
                        <button onClick={() => handleDeleteUser(u._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-lg text-xs hover:bg-rose-500 hover:text-white">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Groups & Member Removal */}
      {activeTab === "groups" && (
        <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">Study Groups & Member Moderation</h2>
          {groups.map((group) => (
            <div key={group._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{group.name} <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded ml-2">{group.skill}</span></h3>
                  <p className="text-xs text-slate-400">{group.description}</p>
                </div>
                <button onClick={() => handleDeleteGroup(group._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-500 hover:text-white">Delete Group</button>
              </div>
              {/* Members List with Remove button */}
              {/* Members List */}
<div className="flex flex-wrap gap-2">
  {group.members?.map((member) => (
    <div key={member._id || member} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs">
      {/* 👈 እውነተኛውን ስም ማሳየት */}
      <span className="text-slate-200">{member.name || "Unknown User"}</span>
      <button onClick={() => handleRemoveMember(group._id, member._id || member)} className="text-rose-400 hover:text-rose-200 font-bold ml-1" title="Remove member">×</button>
    </div>
  ))}
</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Group Chats & Files */}
      {activeTab === "chats" && (
        <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-3">
          <h2 className="text-lg font-bold text-white mb-4">Group Chat Messages & Uploaded Files</h2>
          {messages.map((msg) => (
            <div key={msg._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-indigo-400 font-semibold">Group: {msg.groupId?.name || "General"} | Sender: {msg.sender?.name}</p>
                <div className="text-sm text-slate-200 mt-1" dangerouslySetInnerHTML={{ __html: msg.message }} />
                <p className="text-[10px] text-slate-500 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => handleDeleteMessage(msg._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-500 hover:text-white">Delete Message/File</button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Community Q&A */}
      {activeTab === "questions" && (
        <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-3">
          <h2 className="text-lg font-bold text-white mb-4">Community Questions Moderation</h2>
          {questions.map((q) => (
            <div key={q._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">{q.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{q.content}</p>
                <p className="text-[10px] text-indigo-400 mt-1">Author: {q.author?.name}</p>
              </div>
              <button onClick={() => handleDeleteQuestion(q._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-500 hover:text-white">Delete Question</button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Reviews */}
      {activeTab === "reviews" && (
        <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-3">
          <h2 className="text-lg font-bold text-white mb-4">Platform Reviews Moderation</h2>
          {reviews.map((rev) => (
            <div key={rev._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-indigo-400 font-semibold">From: {rev.reviewer?.name} ➔ To: {rev.reviewedUser?.name}</p>
                <p className="text-sm text-slate-200 mt-1">Rating: ⭐ {rev.rating}/5 | Comment: "{rev.comment}"</p>
              </div>
              <button onClick={() => handleDeleteReview(rev._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-500 hover:text-white">Delete Review</button>
            </div>
          ))}
        </div>
      )}

      
    </div>
  );
}