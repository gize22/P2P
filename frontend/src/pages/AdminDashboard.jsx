import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import io from "socket.io-client"; // 👈 ሶኬት ማምጣት

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, totalQuestions: 0 });
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  
  const isDark = localStorage.getItem("theme") === "dark";

  const [announcementText, setAnnouncementText] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState(null);
  const [warningText, setWarningText] = useState("");

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

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/announcement", {
        message: announcementText,
        adminId: user.id
      });
      alert("Announcement sent to all students successfully!");
      setAnnouncementText("");
    } catch (err) {
      alert("Failed to send announcement");
    }
  };

  const triggerWarningModal = (studentId) => {
    setTargetStudentId(studentId);
    setShowWarningModal(true);
  };

  // 👈 የ Warning መልእክት በሰላም መላኪያ ፊንክሽን
  const handleSendDirectWarning = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/admin/send-warning", {
        adminId: user.id,
        studentId: targetStudentId,
        message: warningText
      });
      alert(res.data.message || "Warning sent directly to the student!");
      setShowWarningModal(false);
      setWarningText("");
    } catch (err) {
      console.error("Warning error:", err);
      alert(err.response?.data?.message || "Failed to send warning");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  const bgMain = isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900";
  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";
  const bgInnerCard = isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800";
  const inputStyle = isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";
  const tableTextMain = isDark ? "text-white font-medium" : "text-gray-900 font-medium";
  const tableTextSub = isDark ? "text-slate-300" : "text-gray-600";

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-200 ${bgMain}`}>
      
      {/* Top Header */}
      <div className={`w-full px-6 py-4 shadow-md flex justify-between items-center border-b ${bgCard}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Admin Control Panel</h1>
            <p className="text-[11px] text-yellow-600 dark:text-yellow-400">Administrator: {user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-slate-800 text-xs font-semibold shadow-xs" title="Toggle Theme">
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button onClick={handleLogout} className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-rose-600">
            Logout
          </button>
        </div>
      </div>

      {/* Main Body (Sidebar + Content) */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        
        {/* Sidebar */}
        <div className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-4 shrink-0 ${bgCard}`}>
          <nav className="space-y-1.5">
            {[
              { id: "users", label: `👥 Users (${users.length})` },
              { id: "announcement", label: "📢 Announcement" },
              { id: "groups", label: `📚 Study Groups (${groups.length})` },
              { id: "chats", label: `💬 Group Chats (${messages.length})` },
              { id: "questions", label: `❓ Community Q&A (${questions.length})` },
              { id: "reviews", label: `⭐ Reviews (${reviews.length})` },
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          
          {/* Stats Cards */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className={`p-5 rounded-2xl shadow-lg border ${bgCard}`}>
              <p className="text-[11px] font-semibold text-gray-400 uppercase">Total Users</p>
              <h3 className="text-2xl font-extrabold mt-1">{users.length}</h3>
            </div>
            <div className={`p-5 rounded-2xl shadow-lg border ${bgCard}`}>
              <p className="text-[11px] font-semibold text-gray-400 uppercase">Study Groups</p>
              <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">{groups.length}</h3>
            </div>
            <div className={`p-5 rounded-2xl shadow-lg border ${bgCard}`}>
              <p className="text-[11px] font-semibold text-gray-400 uppercase">Community Questions</p>
              <h3 className="text-2xl font-extrabold text-purple-400 mt-1">{questions.length}</h3>
            </div>
          </div>

          {/* Tab 1: Users */}
          {activeTab === "users" && (
            <div className={`w-full rounded-2xl shadow-lg p-6 border overflow-x-auto ${bgCard}`}>
              <h2 className="text-lg font-bold mb-4">Manage Platform Users</h2>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-sm">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className={`py-3 px-4 ${tableTextMain}`}>{u.name}</td>
                      <td className={`py-3 px-4 ${tableTextSub}`}>{u.email}</td>
                      <td className="py-3 px-4"><span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full">{u.role}</span></td>
                      <td className="py-3 px-4 text-right flex justify-end gap-2">
                          <button onClick={() => navigate(`/private-chat/${otherUserId}`)} className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1">
                            <span>Direct Chat</span>
                           </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-lg text-xs">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Announcement */}
          {activeTab === "announcement" && (
            <div className={`w-full rounded-2xl shadow-lg p-6 border ${bgCard}`}>
              <h2 className="text-lg font-bold mb-2">📢 Send Platform Announcement</h2>
              <p className="text-xs text-gray-400 mb-4">Broadcast an important warning or message to all active students instantly.</p>
              <form onSubmit={handleSendAnnouncement} className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Type announcement message here..." value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} required className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg">Broadcast</button>
              </form>
            </div>
          )}

          {/* Tab 3: Groups */}
          {activeTab === "groups" && (
            <div className={`w-full rounded-2xl shadow-lg p-6 space-y-4 border ${bgCard}`}>
              <h2 className="text-lg font-bold mb-4">Study Groups & Members</h2>
              {groups.map((group) => (
                <div key={group._id} className={`p-4 border rounded-xl ${bgInnerCard}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <div>
                      <h3 className={`text-sm font-bold ${tableTextMain}`}>{group.name}</h3>
                      <p className={`text-xs ${tableTextSub}`}>{group.description}</p>
                    </div>
                    <button onClick={() => handleDeleteGroup(group._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs">Delete Group</button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
                    {group.members?.map((m) => (
                      <div key={m._id || m} className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs border ${bgCard}`}>
                        <span className={tableTextMain}>{m.name || "Member"}</span>
                        <button onClick={() => handleRemoveMember(group._id, m._id || m)} className="text-rose-400 font-bold">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Chats */}
          {/* Tab 3: Chats */}
          {activeTab === "chats" && (
            <div className={`w-full rounded-2xl shadow-lg p-6 space-y-3 border ${bgCard}`}>
              <h2 className="text-lg font-bold mb-4">Group Messages & Files</h2>
              {messages.length === 0 ? (
                <p className="text-sm text-gray-400">No group messages found.</p>
              ) : (
                messages.map((msg) => {
                  // 👈 ዩሰሩ ከተሰረዘ (null ከሆነ) ባዶ እንዳይሆን
                  const senderName = msg.sender?.name || "Deleted User";
                  const senderEmail = msg.sender?.email ? `(${msg.sender.email})` : "";

                  return (
                    <div key={msg._id} className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${bgInnerCard}`}>
                      <div>
                        <p className="text-xs text-indigo-400 font-semibold">
                          Group: {msg.groupId?.name || "General"} | Sender: {senderName} <span className="text-gray-400">{senderEmail}</span>
                        </p>
                        <div className={`text-sm mt-1 ${tableTextMain}`} dangerouslySetInnerHTML={{ __html: msg.message }} />
                      </div>
                      <div className="flex gap-2">
                        {msg.sender?._id && (
                          <button onClick={() => triggerWarningModal(msg.sender._id)} className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg text-xs">Send Warning</button>
                        )}
                        <button onClick={() => handleDeleteMessage(msg._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs">Delete</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 5: Questions */}
          {activeTab === "questions" && (
            <div className={`w-full rounded-2xl shadow-lg p-6 space-y-3 border ${bgCard}`}>
              <h2 className="text-lg font-bold mb-4">Community Questions</h2>
              {questions.map((q) => (
                <div key={q._id} className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${bgInnerCard}`}>
                  <div>
                    <h3 className={`text-sm font-bold ${tableTextMain}`}>{q.title}</h3>
                    <p className={`text-xs mt-1 ${tableTextSub}`}>{q.content}</p>
                  </div>
                  <button onClick={() => handleDeleteQuestion(q._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs">Delete</button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 6: Reviews */}
          {activeTab === "reviews" && (
            <div className={`w-full rounded-2xl shadow-lg p-6 space-y-3 border ${bgCard}`}>
              <h2 className="text-lg font-bold mb-4">Platform Reviews</h2>
              {reviews.map((rev) => (
                <div key={rev._id} className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${bgInnerCard}`}>
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold">From: {rev.reviewer?.name} ➔ To: {rev.reviewedUser?.name}</p>
                    <p className={`text-sm mt-1 ${tableTextMain}`}>Rating: ⭐ {rev.rating}/5 | Comment: "{rev.comment}"</p>
                  </div>
                  <button onClick={() => handleDeleteReview(rev._id)} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-xs">Delete</button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <form onSubmit={handleSendDirectWarning} className={`border p-6 rounded-3xl shadow-2xl w-full max-w-md ${bgCard}`}>
            <h3 className="text-lg font-bold mb-2 text-amber-400">⚠️ Send Warning to Student</h3>
            <p className="text-xs text-gray-400 mb-4">This message will appear directly in the student's private chats from the administration.</p>
            <textarea placeholder="Type warning message..." value={warningText} onChange={(e) => setWarningText(e.target.value)} required rows="4" className={`w-full mb-4 p-3 border rounded-xl text-sm focus:outline-none ${inputStyle}`} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowWarningModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
              <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">Send Warning</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}