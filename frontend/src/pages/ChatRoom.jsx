import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import API from "../api";
import Navbar from "../components/Navbar";

const socket = io("https://p2plearn.onrender.com/api");

export default function ChatRoom() {
  const { groupId } = useParams();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const isDark = localStorage.getItem("theme") === "dark";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // የ ግሩፕ መረጃ ማምጣት
   API.get(`/chats/group/${groupId}`)
      .then((res) => {
        console.log("Fetched history messages:", res.data); // 👈 ታሪኩ መምጣቱን እንይ
        setMessages(res.data);
      })
      .catch((err) => console.error("Error fetching messages", err));

    // 👈 1. ዳታቤዝ ውስጥ የተቀመጡትን የጥናት ቡድን ቻት ታሪክ (Chat History) ማምጣት
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

    // 👈 2. አዲስ መልእክት ሲመጣ በሪል-ታይም ወደ ስቴት መጨመር
    const handleReceiveMessage = (data) => {
      setMessages((prev) => {
        // ዱፕሊኬት (Duplicate) እንዳይፈጠር ማረጋገጥ
        const exists = prev.some((msg) => msg._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
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

    // 👈 መልእክቱን ለሰርቨር መላክ (ሰርቨሩ ዳታቤዝ ላይ ሪከርድ አድርጎ ለሁሉም ያደርሰዋል)
    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  // ምስል ወይም ፋይል ዩፕሎድ ለማድረግ
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/chats/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = res.data.fileUrl;
      const messageData = {
        sender: user.id,
        groupId: groupId,
        message: `<div class="flex items-center gap-2 p-2 rounded border">
                    <span>📄</span>
                    <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="underline text-blue-600 font-semibold text-xs hover:text-blue-800">
                      View/Download: ${file.name}
                    </a>
                  </div>`,
      };

      socket.emit("send_message", messageData);
    } catch (err) {
      alert("Failed to upload file");
    }
  };

  if (!user) return null;

  const bgMain = isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900";
  const bgCard = isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900";
  const inputStyle = isDark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-400" : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <div className={`min-h-screen w-full flex flex-col p-4 sm:p-6 transition-colors duration-200 ${bgMain}`}>
      <Navbar user={user} />

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
            // 👈 የላኪውን ስም በግልጽ ማምጣት (() እንዳይኖር)
            const senderName = msg.sender?.name || (isMe ? "You" : "Member");

            return (
              <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-semibold">{senderName}</span>
                <div className={`p-3 rounded-xl max-w-xs md:max-w-md text-sm shadow-sm ${
                  isMe ? "bg-[#eeffde] text-black rounded-br-none" : "bg-white text-black rounded-tl-none border border-gray-200"
                }`}>
                  {/* 👈 ጽሁፍም ሆነ ፋይል ቢሆን በሰላም እንዲነበብ */}
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
        <form onSubmit={sendMessage} className={`p-3 border-t flex items-center gap-2 ${bgCard}`}>
          <input type="file" onChange={handleFileUpload} className="hidden" id="groupFileInput" />
          <label htmlFor="groupFileInput" className="cursor-pointer p-2 text-gray-400 hover:text-indigo-500 text-lg" title="Attach File">
            📎
          </label>

          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`flex-1 px-4 py-2.5 rounded-full text-sm focus:outline-none border ${inputStyle}`}
          />
          <button type="submit" className="bg-[#2b5278] hover:bg-[#1e3a5f] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow">
            Send
          </button>
        </form>

      </div>
    </div>
  );
}