# 🚀 P2P Learn — Peer-to-Peer Learning Platform

A full-stack web application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) combined with **Socket.IO** for real-time communication. This platform connects university students so they can teach, learn, collaborate in study groups, and review each other.

---

## ✨ Key Features

- **🔐 Authentication & Security:** 
  - User registration with real-time **Email OTP Verification**.
  - Secure **JWT Authentication** & bcrypt password hashing.
  - Forgot & Reset Password functionality.
- **👥 Smart Skill Matching & Search:**
  - Automated recommendation system matching students based on *Skills to Teach* and *Skills to Learn*.
  - Skill-based search and filter functionality.
- **🤝 Peer Connections & Sessions:**
  - Send, accept, or reject learning requests.
  - Schedule live learning sessions and track session statuses.
  - Rate and review learning partners upon completion.
- **💬 Real-time Chat & Study Groups (Socket.IO):**
  - Telegram-style 1-to-1 private messaging with **Read/Seen (✓✓)** receipts.
  - Real-time Study Group creation, joining, and group chat.
  - Direct file/image sharing and downloading.
- **❓ Community Q&A Forum:**
  - Post technical questions and receive answers from peers.
- **🛡️ Admin Control Panel:**
  - Full platform statistics overview (Total users, groups, questions).
  - User management (Delete users, promote to admin).
  - Content moderation (Delete groups, remove members, delete inappropriate chat files/messages, and remove Q&A posts).
  - Broadcast platform announcements to all students.
- **🌙☀️ UI/UX & Themes:**
  - Fully responsive design for mobile, tablet, and desktop devices.
  - Instant **Dark/Light Mode** switcher across all pages.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- Socket.IO Client

**Backend:**
- Node.js
- Express.js
- MongoDB & Mongoose
- Socket.IO
- Nodemailer / Resend API (for Email OTP & Password Reset)
- Bcrypt.js & JSON Web Tokens (JWT)

---

## 📁 Project Structure

```text
P2P/
├── backend/
│   ├── models/        # Mongoose schemas (User, Group, Message, Session, Review, Question, Answer, Contact, GroupInvite)
│   ├── routes/        # Express API endpoints (auth, users, requests, sessions, reviews, groups, chats, questions, admin, contact)
│   └── server.js      # Main Express & Socket.IO server setup
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components (Navbar, RequestsList, FindLearners, Logo)
    │   ├── pages/      # Main views (Home, Login, Register, VerifyOTP, Dashboard, Groups, ChatRoom, PrivateChat, Community, Profile, AdminDashboard, HowItWorks, ForgotPassword, ResetPassword)
    │   ├── api.js      # Axios configuration
    │   └── ThemeContext.jsx # Global Dark/Light mode provider