import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import ChatRoom from "./pages/ChatRoom";
import PrivateChat from "./pages/PrivateChat"; // 
import Profile from "./pages/Profile"; 
import Community from "./pages/Community"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/groups" element={<Groups />} />
        <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/chat/:groupId" element={<ChatRoom />} />
          <Route path="/private-chat/:receiverId" element={<PrivateChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
      </Routes>
    </BrowserRouter>
  );
}