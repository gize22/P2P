import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [learners, setLearners] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchSkill, setSearchSkill] = useState("");

  const isDark = localStorage.getItem("theme") === "dark";
  
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchAllLearners(parsedUser.id);
      fetchMyRequests(parsedUser.id);
      fetchMySessions(parsedUser.id);
      fetchAnnouncements();

      socket.emit("join_room", parsedUser.id);

      socket.on("receive_request", (newReq) => {
        setMyRequests((prev) => [newReq, ...prev]);
        alert("You received a new learning request!");
      });

      socket.on("receive_notification", () => {
        alert("New message received! Check your chats.");
      });

      socket.on("receive_announcement", (ann) => {
        setAnnouncements((prev) => [ann, ...prev]);
      });
    }

    return () => {
      socket.off("receive_request");
      socket.off("receive_notification");
      socket.off("receive_announcement");
    };
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

  const fetchAllLearners = async (currentUserId, skill = "") => {
    try {
      setLoading(true);
      const url = skill ? `/users?search=${skill}` : `/users`;
      const res = await API.get(url);
      setLearners(res.data.filter(l => l._id !== currentUserId));
    } catch (err) {
      console.error("Error fetching learners", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async (userId) => {
    try {
      const res = await API.get(`/requests/user/${userId}`);
      const formatted = res.data.map(req => ({
        ...req,
        isReceiver: req.receiver?._id === userId
      }));
      setMyRequests(formatted);
    } catch (err) {
      console.error("Error fetching requests", err);
    }
  };

  const fetchMySessions = async (userId) => {
    try {
      const res = await API.get(`/sessions/user/${userId}`);
      setMySessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/admin/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching announcements", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAllLearners(user.id, searchSkill);
  };

  const handleSendRequest = async (receiverId, skill) => {
    try {
      await API.post("/requests", {
        sender: user.id,
        receiver: receiverId,
        skill: skill || "General",
        message: "Hi, I want to learn with you!",
      });
      alert("Learning request sent successfully!");
      fetchMyRequests(user.id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await API.put(`/requests/${requestId}`, { status });
      alert(`Request ${status} successfully!`);
      fetchMyRequests(user.id);
    } catch (err) {
      alert("Failed to update request status");
    }
  };

  const openSessionModal = (req) => {
    setSelectedRequest(req);
    setShowSessionModal(true);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const teacherId = selectedRequest.receiver._id === user.id ? user.id : selectedRequest.receiver._id;
      const learnerId = selectedRequest.sender._id === user.id ? user.id : selectedRequest.sender._id;

      await API.post("/sessions", {
        teacher: teacherId,
        learner: learnerId,
        skill: selectedRequest.skill,
        date: sessionDate,
        time: sessionTime,
      });

      alert("Learning session scheduled successfully!");
      setShowSessionModal(false);
      setSessionDate("");
      setSessionTime("");
      fetchMySessions(user.id);
    } catch (err) {
      alert("Failed to schedule session");
    }
  };

  // 👈 ሴክሽኑን እንደተጠናቀቀ (Completed) ማድረጊያ ተግባር
  const handleCompleteSession = async (sessionId) => {
    try {
      await API.put(`/sessions/${sessionId}`, { status: "completed" });
      alert("Session marked as completed successfully!");
      fetchMySessions(user.id);
    } catch (err) {
      alert("Failed to complete session");
    }
  };

  const openReviewModal = (session) => {
    setSelectedSessionForReview(session);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const reviewedUserId = selectedSessionForReview.teacher._id === user.id 
        ? selectedSessionForReview.learner._id 
        : selectedSessionForReview.teacher._id;

      await API.post("/reviews", {
        reviewer: user.id,
        reviewedUser: reviewedUserId,
        session: selectedSessionForReview._id,
        rating: Number(rating),
        comment
      });

      alert("Review submitted successfully!");
      setShowReviewModal(false);
      setComment("");
      setRating(5);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  const bgMain = isDark ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900";
  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";
  const bgInnerCard = isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800";
  const inputStyle = isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen w-full p-4 sm:p-8 transition-colors duration-200 ${bgMain}`}>
      
      {/* Navbar (Header) */}
      <div className={`w-full p-4 sm:p-6 rounded-2xl shadow-xl flex justify-between items-center mb-8 border ${bgCard}`}>
        <div className="flex items-center gap-3">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
            alt="Avatar" 
            className="w-11 h-11 rounded-full bg-indigo-50 border-2 border-indigo-500/30 shadow-sm object-cover"
          />
          <div>
            <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">{user.name}</h1>
            <p className="text-[11px] sm:text-xs text-indigo-400 mt-0.5">{user.university} | Role: <span className="uppercase font-semibold">{user.role}</span></p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
          <Link to="/groups" className="text-sm font-medium hover:underline">Study Groups</Link>
          <Link to="/community" className="text-sm font-medium hover:underline">Community</Link>
          <Link to="/profile" className="text-sm font-medium hover:underline">Profile</Link>

          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-200 dark:bg-slate-800 text-xs font-semibold shadow-xs" title="Toggle Theme">
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button onClick={handleLogout} className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-rose-600">
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-200 dark:bg-slate-800 text-xs">
            {isDark ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 focus:outline-none">
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`w-full p-4 rounded-2xl mb-6 border flex flex-col space-y-3 ${bgCard}`}>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Dashboard</Link>
          <Link to="/groups" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Study Groups</Link>
          <Link to="/community" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Community</Link>
          <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium">Profile</Link>
          <button onClick={handleLogout} className="w-full bg-rose-500 text-white py-2 rounded-xl text-xs font-semibold">Logout</button>
        </div>
      )}

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="w-full mb-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-md flex items-start gap-3">
          <span className="text-2xl">📢</span>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">Platform Announcement</h3>
            <p className="text-xs mt-1 text-amber-100">{announcements[0].message}</p>
          </div>
        </div>
      )}

      {/* Learning Requests & Connections */}
      <div className={`w-full p-6 rounded-2xl shadow-lg mb-8 border ${bgCard}`}>
        <h2 className="text-lg font-bold mb-4">Learning Requests & Connections</h2>
        {myRequests.length === 0 ? (
          <p className="text-sm text-gray-400">No requests found.</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => {
              const otherUser = req.isReceiver ? req.sender : req.receiver;
              const otherUserId = otherUser?._id;

              return (
                <div key={req._id} className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${bgInnerCard}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {otherUser?.name} <span className="text-xs text-gray-400 font-normal">({otherUser?.university})</span>
                      </p>
                      <p className="text-xs text-gray-400">Skill: <strong className="text-indigo-400">{req.skill}</strong> | Message: {req.message}</p>
                      <p className="text-xs mt-1">
                        Status: <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>{req.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                    {req.isReceiver && req.status === "pending" && (
                      <>
                        <button onClick={() => handleUpdateStatus(req._id, "accepted")} className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">Accept</button>
                        <button onClick={() => handleUpdateStatus(req._id, "rejected")} className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">Reject</button>
                      </>
                    )}

                    {req.status === "accepted" && (
                      <div className="flex gap-2">
                        <button onClick={() => openSessionModal(req)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold">Schedule Session</button>
                        {otherUserId && (
                          <button onClick={() => navigate(`/private-chat/${otherUserId}`)} className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1">
                            <span>Direct Chat</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Learning Sessions */}
      <div className={`w-full p-6 rounded-2xl shadow-lg mb-8 border ${bgCard}`}>
        <h2 className="text-lg font-bold mb-4">My Learning Sessions</h2>
        {mySessions.length === 0 ? (
          <p className="text-sm text-gray-400">No scheduled sessions.</p>
        ) : (
          <div className="space-y-3">
            {mySessions.map((session) => (
              <div key={session._id} className={`p-4 border rounded-xl flex justify-between items-center ${bgInnerCard}`}>
                <div>
                  <p className="text-sm font-bold text-indigo-400">Topic: {session.skill}</p>
                  <p className="text-xs text-gray-300">Teacher: {session.teacher?.name} | Learner: {session.learner?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">📅 Date: {session.date} | ⏰ Time: {session.time}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full">{session.status}</span>
                  
                  {/* 👈 ሴክሽኑ scheduled ከሆነ Complete Session በተን ይታያል */}
                  {session.status === "scheduled" && (
                    <button onClick={() => handleCompleteSession(session._id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition">
                      Complete Session ✓
                    </button>
                  )}

                  {/* 👈 ሴክሽኑ completed ከደረሰ ሪቪው መስጫው ይመጣል። */}
                  {session.status === "completed" && (
                    <button onClick={() => openReviewModal(session)} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition">
                      Leave Review ⭐
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Find Learners Search */}
      <div className="w-full mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <input type="text" placeholder="Search learners by skill (e.g., React, JavaScript)..." value={searchSkill} onChange={(e) => setSearchSkill(e.target.value)} className={`flex-1 p-3.5 border rounded-xl shadow-xs text-sm focus:outline-none ${inputStyle}`} />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-medium text-sm transition shadow-lg">Search</button>
        </form>
      </div>

      {/* Available Learning Partners */}
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">Available Learning Partners</h2>
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : learners.length === 0 ? (
          <p className="text-gray-400">No learners found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learners.map((learner) => (
              <div key={learner._id} className={`p-5 rounded-2xl shadow-lg border flex flex-col justify-between ${bgCard}`}>
                <div>
                  <h3 className="text-base font-bold">{learner.name}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{learner.university}</p>
                  <p className="text-xs text-gray-300 mt-3"><strong>Can Teach:</strong> <span className="text-emerald-400">{learner.skillsToTeach?.join(", ") || "None"}</span></p>
                  <p className="text-xs text-gray-300 mt-1"><strong>Wants to Learn:</strong> <span className="text-purple-400">{learner.skillsToLearn?.join(", ") || "None"}</span></p>
                </div>
                <div className="mt-5 flex justify-end">
                  <button onClick={() => handleSendRequest(learner._id, learner.skillsToTeach?.[0])} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition">
                    Send Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <form onSubmit={handleCreateSession} className={`border p-6 rounded-3xl shadow-2xl w-full max-w-md ${bgCard}`}>
            <h3 className="text-lg font-bold mb-4 text-indigo-400">Schedule Learning Session</h3>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Date</label>
            <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required className={`w-full mb-3 p-3 border rounded-xl text-sm ${inputStyle}`} />
            <label className="block text-xs font-semibold text-gray-300 mb-1">Time</label>
            <input type="text" placeholder="e.g. 3:00 PM" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} required className={`w-full mb-4 p-3 border rounded-xl text-sm ${inputStyle}`} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowSessionModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">Save Session</button>
            </div>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <form onSubmit={handleSubmitReview} className={`border p-6 rounded-3xl shadow-2xl w-full max-w-md ${bgCard}`}>
            <h3 className="text-lg font-bold mb-2 text-amber-500">⭐ Rate & Review Session</h3>
            <p className="text-xs text-gray-400 mb-4">Share your experience with your learning partner.</p>
            
            <label className="block text-xs font-semibold mb-1">Rating (1 to 5 Stars)</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)} className={`w-full mb-3 p-3 border rounded-xl text-sm ${inputStyle}`}>
              <option value="5" className="bg-slate-900 text-white">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
              <option value="4" className="bg-slate-900 text-white">⭐⭐⭐⭐ (4 - Very Good)</option>
              <option value="3" className="bg-slate-900 text-white">⭐⭐⭐ (3 - Good)</option>
              <option value="2" className="bg-slate-900 text-white">⭐⭐ (2 - Fair)</option>
              <option value="1" className="bg-slate-900 text-white">⭐ (1 - Poor)</option>
            </select>

            <label className="block text-xs font-semibold mb-1">Comment</label>
            <textarea placeholder="Write your feedback..." value={comment} onChange={(e) => setComment(e.target.value)} required rows="3" className={`w-full mb-4 p-3 border rounded-xl text-sm ${inputStyle}`} />

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowReviewModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
              <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">Submit Review</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}