import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import API from "../api";
import Navbar from "../components/Navbar";

// 👈 ከ /api ውጭ በሆነው ዋናው ሊንክ መገናኘት አለበት
const socket = io("https://p2plearn.onrender.com", {
  transports: ["polling", "websocket"],
  upgrade: true
});


// 👈 ክሮስ-ኦሪጅን ፋይሎችን በኃይል (Force download) የሚያወርድ ግሎባል ሄልፐር
if (typeof window !== "undefined") {
  window.forceDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(url, "_blank"); // ሳያወርድ ቀርቶ an alternative ሆኖ በአዲስ ታብ ይከፍተዋል
    }
  };
}
export default function ChatRoom() {
  const { groupId } = useParams();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // 👈 አዲስ የመጣ ኖቲፊኬሽን ለመያዝ (Real-time Notification State)
  const [notification, setNotification] = useState(null);

  const isDark = localStorage.getItem("theme") === "dark";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 👈 2. የ ግሩፕ መረጃ በትክክል ከ /groups ማምጣት
    API.get("/groups")
      .then((res) => {
        const found = res.data.find((g) => g._id === groupId);
        setGroupInfo(found);
      })
      .catch((err) => console.error("Error fetching group info", err));

    // 3. የጥናት ቡድን ቻት ታሪክ (Chat History) ከዳታቤዝ ማምጣት
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chats/group/${groupId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    fetchMessages();

    // ወደ ቻት ሩም መቀላቀል
    socket.emit("join_room", groupId);
    socket.emit("join_room", parsedUser.id); // 👈 ለ ኖቲፊኬሽን እንዲመች ዩዘሩን በራሱ ID ጆይን ማድረግ

    // 👈 [የተስተካከለ] አዲስ መልእክት ሲመጣ በሪል-ታይም ወደ ስቴት መጨመር እና ኖቲፊኬሽን ማሳየት
    const handleReceiveMessage = (data) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });

      // 👈 ዩዘሩ የላከው ካልሆነ በስተቀር ኖቲፊኬሽን ማሳየት
      const senderId = data.sender?._id || data.sender;
      if (senderId !== parsedUser.id) {
        const senderName = data.sender?.name || "Group Member";
        const msgText = data.message?.includes("<div") ? "Attachment file 📎" : data.message;
        
        setNotification({ name: senderName, message: msgText });
        setTimeout(() => setNotification(null), 4000);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [groupId, navigate]);

  // አዲስ መልእክት ሲመጣ ወደታች SCROLL እንዲያደርግ
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      sender: user.id,
      groupId: groupId,
      message: newMessage,
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  // ምስል ወይም ፋይል ዩፕሎድ ለማድረግ
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB for direct upload.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result;
      
      const messageData = {
        sender: user.id,
        groupId: groupId,
        message: `<div class="flex flex-col gap-1 bg-black/10 dark:bg-white/10 p-2.5 rounded-xl border border-black/10">
                    <div class="flex items-center gap-2">
                      <span>📎</span>
                      <span class="text-xs font-bold truncate max-w-[150px]">${file.name}</span>
                    </div>
                    <a href="${base64String}" download="${file.name}" class="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1">
                      Download File ⬇️
                    </a>
                  </div>`,
      };

      socket.emit("send_message", messageData);
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      alert("Failed to read file.");
    };
  };

  if (!user) return null;

  const bgMain = isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900";
  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";

  return (
    <div className={`min-h-screen w-full flex flex-col p-4 sm:p-6 transition-colors duration-200 ${bgMain}`}>
      <Navbar user={user} />

      {/* 👈 ሪል-ታይም ኖቲፊኬሽን ፖፕ-አፕ (New message from Name: message) */}
      {notification && (
        <div onClick={() => {
          navigate(`/chat/${groupId}`);
          setNotification(null);
        }} className="fixed top-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-bold text-sm">💬</div>
          <div>
            <h4 className="text-xs font-bold text-indigo-400">New message from {notification.name}:</h4>
            <p className="text-xs text-slate-300 mt-0.5 truncate max-w-xs">{notification.message}</p>
          </div>
        </div>
      )}

      <div className={`max-w-4xl mx-auto w-full flex-1 flex flex-col shadow-2xl rounded-2xl overflow-hidden border ${bgCard}`}>
        
        {/* Chat Header */}
        <div className="bg-[#2b5278] text-white p-4 shadow-md">
          <h2 className="text-lg font-bold">{groupInfo ? groupInfo.name : "Study Group Chat"}</h2>
          <p className="text-xs text-indigo-200">Topic: {groupInfo?.skill}</p>
        </div>

        {/* Messages Box */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 h-[450px] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-[#f0f2f5] dark:bg-slate-950">
          {messages.map((msg, index) => {
            const isMe = msg.sender === user.id || msg.sender?._id === user.id;
            const senderName = msg.sender?.name || (isMe ? "You" : "Member");

            return (
              <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-semibold">{senderName}</span>
                <div className={`p-3 rounded-xl max-w-xs md:max-w-md text-sm shadow-sm ${
                  isMe ? "bg-[#eeffde] text-black rounded-br-none" : "bg-white text-black rounded-tl-none border border-gray-200"
                }`}>
                  {msg.message.includes("<a href=") ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                  ) : (
                    <p className="break-words">{msg.message}</p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={sendMessage} className={`p-3 border-t flex items-center gap-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
          <input type="file" onChange={handleFileUpload} className="hidden" id="groupFileInput" />
          <label htmlFor="groupFileInput" className="cursor-pointer p-2 text-gray-400 hover:text-indigo-500 text-lg" title="Attach File">
            📎
          </label>

          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2b5278] text-sm placeholder-gray-500 shadow-inner"
          />
          <button type="submit" className="bg-[#2b5278] hover:bg-[#1e3a5f] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}