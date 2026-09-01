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


export default function PrivateChat() {
  const { receiverId } = useParams();
  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const isDark = localStorage.getItem("theme") === "dark";

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



  const handleBack = () => {
  if (user?.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/dashboard");
  }
};
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

  // 👈 1-to-1 ቻት ላይ ፋይል ወይም ፎቶ ዩፕሎድ ማድረጊያ (View & Download ⬇️ ያለው)
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
      const roomId = getRoomId(user.id, receiverId);

      const messageData = {
        sender: user.id,
        receiver: receiverId,
        room: roomId,
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

      socket.emit("send_private_message", messageData);
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      alert("Failed to read file.");
    };
  };

  if (!user || !receiver) return null;

  return (
    <div className="min-h-screen bg-[#e7efe9] flex flex-col">
      <Navbar user={user} />

      {/* Telegram Style Chat Box Container */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col bg-[#e2f0d9] shadow-lg rounded-xl overflow-hidden my-4 border border-gray-300">
        
        {/* Telegram Header */}
        {/* Telegram Header */}
        <div className="bg-[#2b5278] text-white p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4a76a8] text-white flex items-center justify-center font-bold text-lg">
              {receiver.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">{receiver.name}</h2>
              <p className="text-[11px] text-gray-200">online</p>
            </div>
          </div>

          {/* 👈 የ Back አዝራር እዚህ ሄደር ውስጥ ይገባል */}
          <button onClick={handleBack} className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl transition font-medium">
            ← Back
          </button>
        </div>

        {/* Messages History (Telegram Wallpaper style background) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 h-[450px] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-[#f0f2f5]">
          {messages.map((msg, index) => {
            const isMe = msg.sender === user.id || msg.sender?._id === user.id;
            const timeString = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`relative px-3 py-2 rounded-xl max-w-xs md:max-w-md text-sm shadow-sm ${
                  isMe ? "bg-[#eeffde] text-black rounded-br-none" : "bg-white text-black rounded-tl-none border border-gray-200"
                }`}>
                  {msg.message.includes("<div") ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                  ) : (
                    <p className="pr-12 pb-1 break-words">{msg.message}</p>
                  )}
                  
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

        {/* Telegram Message Input Form with File Upload (📎) */}
        {/* Telegram Message Input Form */}
        <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center gap-2">
          <input type="file" onChange={handleFileUpload} className="hidden" id="privateFileInput" />
          <label htmlFor="privateFileInput" className="cursor-pointer p-2 text-gray-500 dark:text-gray-400 hover:text-[#2b5278] text-lg" title="Attach File">
            📎
          </label>

          <input
            type="text"
            placeholder="Type a private message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            // 👈 የጽሁፍ ከለሩ ጥቁር/ነጭ ሆኖ ከባክግራውንድ ጋር ፈጽሞ እንዳይመሳሰል የተደረገ ጠንካራ ስታይል
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-950 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2b5278] text-sm placeholder-gray-500 shadow-inner"
          />
          <button type="submit" className="bg-[#2b5278] text-white px-5 py-2.5 rounded-full hover:bg-[#1e3a5f] transition shadow font-medium text-xs">
            Send
          </button>
        </form>

      </div>
    </div>
  );
}