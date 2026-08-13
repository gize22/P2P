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
  const [loading, setLoading] = useState(false);
  
  // Session Modal States
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

      // ዩሰሩን በራሱ ID ሩም ውስጥ ማስገባት (ለ ኖቲፊኬሽን)
      socket.emit("join_room", parsedUser.id);

      // አዲስ ሪኩዌስት ሲመጣ (Real-time notification)
      socket.on("receive_request", (newReq) => {
        setMyRequests((prev) => [newReq, ...prev]);
        alert("You received a new learning request!");
      });

      // ከቻት ውጭ ሆኖ መልእክት ሲደርሰው (Real-time chat notification)
      socket.on("receive_notification", () => {
        alert("New message received! Check your chats.");
      });
    }

    return () => {
      socket.off("receive_request");
      socket.off("receive_notification");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <Navbar user={user} />

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <form onSubmit={handleCreateSession} className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-lg font-bold mb-4 text-indigo-600">Schedule Learning Session</h3>
            <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required className="w-full mb-3 p-2 border rounded" />
            <input type="text" placeholder="Time (e.g. 3:00 PM)" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} required className="w-full mb-4 p-2 border rounded" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowSessionModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded text-sm">Cancel</button>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Save Session</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}