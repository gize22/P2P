import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import ChatRoom from "./pages/ChatRoom";
import PrivateChat from "./pages/PrivateChat"; // 
import Profile from "./pages/Profile"; 
import Community from "./pages/Community"
import VerifyOTP from "./pages/VerifyOTP"; 
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import GlobalNotification from "./components/GlobalNotification";



export default function App() {
  return (
    <BrowserRouter>
    <GlobalNotification /> {/* 👈 ቋሚ ኖቲፊኬሽን ሃንድለር */}
      <Routes>
         <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/groups" element={<Groups />} />
      
          <Route path="/chat/:groupId" element={<ChatRoom />} />
          <Route path="/private-chat/:receiverId" element={<PrivateChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          {/* 👈 path="*" ሁልጊዜ ከመጨረሻው ላይ መሆን አለበት */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}