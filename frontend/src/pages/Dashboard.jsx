import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RequestsList from "../components/RequestsList";
import FindLearners from "../components/FindLearners";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [learners, setLearners] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-200">
      <Navbar user={user} />

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="max-w-6xl mx-auto mb-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-md flex items-start gap-3">
          <span className="text-2xl">📢</span>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">Platform Announcement</h3>
            <p className="text-xs mt-1 text-amber-100">{announcements[0].message}</p>
          </div>
        </div>
      )}

      <RequestsList
        myRequests={myRequests}
        mySessions={mySessions}
        onUpdateStatus={handleUpdateStatus}
        onOpenSessionModal={openSessionModal}
      />

      <FindLearners
        learners={learners}
        loading={loading}
        onSearch={(skill) => fetchAllLearners(user.id, skill)}
        onSendRequest={handleSendRequest}
      />

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <form onSubmit={handleCreateSession} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-indigo-600 dark:text-indigo-400">Schedule Learning Session</h3>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Date</label>
            <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required className="w-full mb-3 p-3 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl text-sm dark:text-white" />
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Time</label>
            <input type="text" placeholder="e.g. 3:00 PM" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} required className="w-full mb-4 p-3 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl text-sm dark:text-white" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowSessionModal(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">Save Session</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}