import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://p2plearn.onrender.com", {
  transports: ["polling", "websocket"],
  upgrade: true,
});

export default function GlobalNotification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);

    // ዩዘሩን በራሱ ID ሩም ማስገባት
    socket.emit("join_room", parsedUser.id);

    const handleGlobalNotification = (data) => {
      // ዩዘሩ የላከው ካልሆነ በስተቀር ማሳየት
      const senderId = data.senderId || data.sender?._id || data.sender;
      if (senderId !== parsedUser.id) {
        const senderName = data.senderName || data.sender?.name || "Someone";
        const msgText = data.message?.includes("<div") ? "Attachment file 📎" : data.message;

        setNotification({ name: senderName, message: msgText });
        setTimeout(() => setNotification(null), 5000);
      }
    };

    socket.on("receive_message", handleGlobalNotification);
    socket.on("receive_notification", handleGlobalNotification);

    return () => {
      socket.off("receive_message", handleGlobalNotification);
      socket.off("receive_notification", handleGlobalNotification);
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
      <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-bold text-sm">💬</div>
      <div>
        <h4 className="text-xs font-bold text-indigo-400">New message from {notification.name}:</h4>
        <p className="text-xs text-slate-300 mt-0.5 truncate max-w-xs">{notification.message}</p>
      </div>
    </div>
  );
}