import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 ቻት ውስጥ በክሊክ ለመውሰድ
import io from "socket.io-client";

const socket = io("https://p2plearn.onrender.com", {
  transports: ["polling", "websocket"],
  upgrade: true,
});

export default function GlobalNotification() {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);

    // ዩዘሩን በራሱ ID ሩም ማስገባት
    socket.emit("join_room", parsedUser.id);

    const handleGlobalNotification = (data) => {
      const senderId = data.senderId || data.sender?._id || data.sender;
      
      // ዩዘሩ የራሱ ላኪ ካልሆነ በስተቀር ኖቲፊኬሽን ማሳየት
      if (senderId && senderId !== parsedUser.id) {
        // 👈 የላኪውን ትክክለኛ ስም ለማግኘት (ከ data.senderName ወይም data.sender.name)
        const senderName = data.senderName || data.sender?.name || "User";
        const msgText = data.message?.includes("<div") ? "Attachment file 📎" : data.message;

        setNotification({
          senderId: senderId,
          name: senderName,
          message: msgText,
          isGroup: !!data.groupId,
          groupId: data.groupId
        });

        // ከ 6 ሰከንድ በኋላ በራሱ እንዲጠፋ
        setTimeout(() => setNotification(null), 6000);
      }
    };

    socket.on("receive_message", handleGlobalNotification);
    socket.on("receive_notification", handleGlobalNotification);

    return () => {
      socket.off("receive_message", handleGlobalNotification);
      socket.off("receive_notification", handleGlobalNotification);
    };
  }, []);

  // 👈 ኖቲፊኬሽኑ ላይ ሲጫኑ (Click ሲያደርጉ) ወደ ቻት ሩም በቀጥታ መውሰድ
  const handleClickNotification = () => {
    if (!notification) return;

    if (notification.isGroup && notification.groupId) {
      navigate(`/chat/${notification.groupId}`);
    } else if (notification.senderId) {
      navigate(`/private-chat/${notification.senderId}`);
    }
    
    setNotification(null); // ሲጫኑ ፖፕ-አፑ እንዲጠፋ
  };

  if (!notification) return null;

  return (
    <div 
      onClick={handleClickNotification}
      className="fixed top-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition transform hover:scale-105 animate-slide-down"
    >
      <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-bold text-sm shrink-0">💬</div>
      <div>
        {/* 👈 "Someone" ሳይሆን የላኪው ትክክለኛ ስም ይታያል */}
        <h4 className="text-xs font-bold text-indigo-400">New message from {notification.name}:</h4>
        <p className="text-xs text-slate-300 mt-0.5 truncate max-w-xs">{notification.message}</p>
        <span className="text-[10px] text-indigo-300 underline mt-1 block">Click to open chat ➔</span>
      </div>
    </div>
  );
}