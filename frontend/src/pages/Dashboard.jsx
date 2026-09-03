import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RequestsList from "../components/RequestsList";
import FindLearners from "../components/FindLearners";
import io from "socket.io-client";
import { useTheme } from "../ThemeContext";

// 👈 ከ /api ውጭ በሆነው ዋናው ሊንክ መገናኘት አለበት
const socket = io("https://p2plearn.onrender.com", {
  transports: ["polling", "websocket"],
  upgrade: true
});

export default function Dashboard() {
  const { isDark } = useTheme();

  const [user, setUser] = useState(null);
  const [learners, setLearners] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchSkill, setSearchSkill] = useState("");
  
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");

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
      fetchRecommendations(parsedUser.id);

      socket.emit("join_room", parsedUser.id);

      socket.on("receive_request", (newReq) => {
        setMyRequests((prev) => [newReq, ...prev]);
        alert("You received a new learning request!");
      });

      socket.on("send_private_message", async (data) => {
        try {
          const { sender, receiver, room, message } = data;
          let newMessage = await Message.create({ sender, receiver, message });
          newMessage = await newMessage.populate("sender", "name");

          io.to(room).emit("receive_message", newMessage);

          io.to(receiver.toString()).emit("receive_notification", {
            senderId: sender,
            senderName: newMessage.sender.name,
            message: message,
            type: "private_chat"
          });
        } catch (error) {
          console.error("Private message error:", error);
        }
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

  const fetchRecommendations = async (userId) => {
    try {
      const res = await API.get(`/users/recommendations/${userId}`);
      setRecommendations(res.data);
    } catch (err) {
      console.error("Error fetching recommendations", err);
    }
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

  if (!user) return null;

  const bgMain = isDark ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900";
  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";
  const bgInnerCard = isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800";
  const inputStyle = isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen w-full p-4 sm:p-8 transition-colors duration-200 ${bgMain}`}>
      
      {/* 👈 ማዕቀፉ ሰፋ ብሎ በዴስክቶፕ ውብ ሆኖ እንዲታይ በ max-w-[1500px] ተስተካክሏል */}
      <div className="w-full max-w-[1500px] mx-auto">
        <Navbar user={user} />
      </div>

      <div className="w-full max-w-[1500px] mx-auto space-y-8">
        
        {/* Announcements Banner */}
        {announcements.length > 0 && (
          <div className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-lg flex items-start gap-4">
            <span className="text-3xl">📢</span>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide">Platform Announcement</h3>
              <p className="text-xs md:text-sm mt-1 text-amber-100">{announcements[0].message}</p>
            </div>
          </div>
        )}

        {/* ✨ Recommended Learning Partners (Smart Matching Section) */}
        {recommendations.length > 0 && (
          <div className={`w-full p-6 sm:p-8 rounded-2xl shadow-lg border ${bgCard}`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg sm:text-xl font-bold text-indigo-400">Recommended Learning Partners (Smart Match)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((partner) => (
                <div key={partner._id} className={`p-5 border rounded-xl flex flex-col justify-between ${bgInnerCard}`}>
                  <div>
                    <h3 className="text-base font-bold">{partner.name}</h3>
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">{partner.university}</p>
                    <p className="text-xs mt-3"><strong>Can Teach:</strong> <span className="text-emerald-400 font-medium">{partner.skillsToTeach?.join(", ")}</span></p>
                    <p className="text-xs text-gray-400 mt-1.5">Matched based on your learning goals!</p>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button onClick={() => handleSendRequest(partner._id, partner.skillsToTeach?.[0])} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md">
                      Connect & Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Find Learners Component */}
        <div className="w-full">
          <FindLearners
            learners={learners}
            loading={loading}
            onSearch={(skill) => fetchAllLearners(user.id, skill)}
            onSendRequest={handleSendRequest}
          />
        </div>

        {/* Requests & Sessions Component */}
        <div className="w-full">
          <RequestsList
            myRequests={myRequests}
            mySessions={mySessions}
            onUpdateStatus={handleUpdateStatus}
            onOpenSessionModal={openSessionModal}
            onCompleteSession={handleCompleteSession}
            onOpenReviewModal={openReviewModal}
          />
        </div>

      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 z-50">
          <form onSubmit={handleCreateSession} className={`border p-6 rounded-3xl shadow-2xl w-full max-w-md ${bgCard}`}>
            <h3 className="text-lg font-bold mb-4 text-indigo-400">Schedule Learning Session</h3>
            <label className="block text-xs font-semibold mb-1">Date</label>
            <input 
              type="date" 
              value={sessionDate} 
              onChange={(e) => setSessionDate(e.target.value)} 
              required 
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
              className={`w-full mb-3 p-3 border rounded-xl text-sm ${inputStyle}`} 
            />
            <label className="block text-xs font-semibold mb-1">Time</label>
            <input 
              type="text" 
              placeholder="e.g. 3:00 PM" 
              value={sessionTime} 
              onChange={(e) => setSessionTime(e.target.value)} 
              required 
              className={`w-full mb-4 p-3 border rounded-xl text-sm ${inputStyle}`} 
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowSessionModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">Save Session</button>
            </div>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 z-50">
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