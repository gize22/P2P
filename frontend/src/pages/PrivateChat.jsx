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

export default function PrivateChat() {
  const { receiverId } = useParams();
  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const getRoomId = (id1, id2) => {
    return [id1, id2].sort().join("_");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    API.get(`/users/${receiverId}`)
      .then((res) => setReceiver(res.data))
      .catch((err) => console.error("Error fetching receiver info", err));

    const roomId = getRoomId(parsedUser.id, receiverId);

    // የቻት ታሪክ ማምጣት
    API.get(`/chats/${parsedUser.id}/${receiverId}`)
      .then((res) => {
        setMessages(res.data);
        socket.emit("mark_messages_read", { sender: receiverId, receiver: parsedUser.id });
      })
      .catch((err) => console.error("Error fetching private messages", err));

    // 👈 የሁለቱንም ሩም እና የዩሰሩን ራሱ ID ጆይን ማድረግ (ለ ኖቲፊኬሽን)
    socket.emit("join_room", roomId);
    socket.emit("join_room", parsedUser.id);

    // 👈 ሪል-ታይም መልእክት ሲመጣ ያለ ሪፍሬሽ በሰከንዶች ውስጥ Screen ላይ እንዲታይ
    const handleReceiveMessage = (data) => {
      // መልእክቱ የዚህ ቻት ሩም ከሆነ ብቻ ወደ ስቴት መጨመር
      if (data.sender === receiverId || data.receiver === receiverId) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data._id);
          if (exists) return prev;
          return [...prev, data];
        });
        socket.emit("mark_messages_read", { sender: receiverId, receiver: parsedUser.id });
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    socket.on("messages_read", ({ reader }) => {
      if (reader === receiverId) {
        setMessages((prev) => prev.map(msg => ({ ...msg, read: true })));
      }
    });

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_read");
    };
  }, [receiverId, navigate]);
  // አዲስ መልእክት ሲመጣ ወደታች SCROLL እንዲያደርግ
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const roomId = getRoomId(user.id, receiverId);

    const messageData = {
      sender: user.id,
      receiver: receiverId,
      room: roomId,
      message: newMessage,
    };

    socket.emit("send_private_message", messageData);
    setNewMessage("");
  };

  if (!user || !receiver) return null;

  return (
    <div className="min-h-screen bg-[#e7efe9] flex flex-col">
      <Navbar user={user} />

      {/* Telegram Style Chat Box Container */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col bg-[#e2f0d9] shadow-lg rounded-xl overflow-hidden my-4 border border-gray-300">
        
        {/* Telegram Header */}
        <div className="bg-[#2b5278] text-white p-3 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-full bg-[#4a76a8] text-white flex items-center justify-center font-bold text-lg">
            {receiver.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight">{receiver.name}</h2>
            <p className="text-[11px] text-gray-200">online</p>
          </div>
        </div>

        {/* Messages History (Telegram Wallpaper style background) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 h-[450px] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-[#f0f2f5]">
          {messages.map((msg, index) => {
            const isMe = msg.sender === user.id || msg.sender?._id === user.id;
            const timeString = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`relative px-3 py-2 rounded-xl max-w-xs md:max-w-md text-sm shadow-sm ${
                  isMe ? "bg-[#eeffde] text-black rounded-tr-none" : "bg-white text-black rounded-tl-none border border-gray-200"
                }`}>
                  <p className="pr-12 pb-1 break-words">{msg.message}</p>
                  
                  {/* Time and Seen (✓✓) Symbol */}
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-gray-500 select-none">
                    <span>{timeString}</span>
                    {isMe && (
                      <span className={`font-bold tracking-tighter ${msg.read ? "text-blue-500" : "text-gray-400"}`}>
                        ✓✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Telegram Message Input Form */}
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a private message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            // 👈 ጽሁፉ በግልጽ ጥርት ብሎ እንዲታይ የተደረገ inputStyle
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-1 focus:ring-[#2b5278] text-sm placeholder-gray-400"
          />
          <button type="submit" className="bg-[#2b5278] text-white p-2.5 rounded-full hover:bg-[#1e3a5f] transition shadow">
            <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </form>

      </div>
    </div>
  );
}