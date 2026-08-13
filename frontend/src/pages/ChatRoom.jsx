import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import API from "../api";
import Navbar from "../components/Navbar";

const socket = io("http://localhost:5000");

export default function ChatRoom() {
  const { groupId } = useParams();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // የ ግሩፕ መረጃ ማምጣት
    API.get("/groups")
      .then((res) => {
        const found = res.data.find((g) => g._id === groupId);
        setGroupInfo(found);
      })
      .catch((err) => console.error("Error fetching group info", err));

    // የጥናት ቡድን ቻት ታሪክ (Chat History) ከዳታቤዝ ማምጣት
    API.get(`/chats/group/${groupId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages", err));

    // ወደ ቻት ሩም መቀላቀል
    socket.emit("join_room", groupId);

    // መልእክት ሲመጣ ማዳመጥ (Listen)
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
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
        // 👈 target="_blank" እና rel="noopener noreferrer" ሲነካው በአዲስ ታብ (Preview) እንጂ አውቶማቲክ ዳውንሎድ እንዳያደርግ ያደርገዋል
        message: `<div class="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                    <span>📄</span>
                    <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="underline text-blue-600 font-semibold text-xs hover:text-blue-800">
                      View/Download: ${file.name}
                    </a>
                  </div>`,
      };
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
        message: `<a href="${fileUrl}" target="_blank" class="underline text-blue-600 font-bold">[Attachment: ${file.name}]</a>`,
      };

      socket.emit("send_message", messageData);
    } catch (err) {
      alert("Failed to upload file");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#e7efe9] flex flex-col">
      <Navbar user={user} />

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-[#e2f0d9] shadow-lg rounded-xl overflow-hidden my-4 border border-gray-300">
        
        {/* Chat Header */}
        <div className="bg-[#2b5278] text-white p-4 shadow-md">
          <h2 className="text-lg font-bold">{groupInfo ? groupInfo.name : "Study Group Chat"}</h2>
          <p className="text-xs text-indigo-200">Topic: {groupInfo?.skill}</p>
        </div>

        {/* Messages Box */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 h-[450px] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-[#f0f2f5]">
          {messages.map((msg, index) => {
            const isMe = msg.sender === user.id || msg.sender?._id === user.id;
            const senderName = msg.sender?.name || (isMe ? "You" : "Member");

            return (
              <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-gray-500 mb-0.5 px-1 font-semibold">{isMe ? "You" : senderName}</span>
                <div className={`p-3 rounded-xl max-w-xs md:max-w-md text-sm shadow-sm ${
                  isMe ? "bg-[#eeffde] text-black rounded-br-none" : "bg-white text-black rounded-tl-none border border-gray-200"
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          {/* File Upload Button */}
          <input type="file" onChange={handleFileUpload} className="hidden" id="groupFileInput" />
          <label htmlFor="groupFileInput" className="cursor-pointer p-2 text-gray-500 hover:text-indigo-600 text-lg" title="Attach File">
            📎
          </label>

          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#2b5278] text-sm"
          />
          <button type="submit" className="bg-[#2b5278] text-white px-5 py-2 rounded-full hover:bg-[#1e3a5f] text-sm font-medium shadow">
            Send
          </button>
        </form>

      </div>
    </div>
  );
}