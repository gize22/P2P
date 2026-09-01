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

⚙️ Installation & Setup Locally
Prerequisites
Node.js installed on your machine.
MongoDB Atlas account (or local MongoDB).
1. Clone the Repository
git clone https://github.com/gize22/P2P.git
cd P2P
2. Backend Setup
cd backend
npm install
Create a .env file inside the backend/ folder and add your environment variables:
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
RESEND_API_KEY=your_resend_api_key
Run the backend server:
node server.js
3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
cd frontend
npm install
Create a .env file inside the frontend/ folder (optional for local development):
VITE_API_URL=http://localhost:5000/api
Run the frontend development server:
npm run dev
🚀 Deployment
Backend: Deployed on Render (Web Service).
Frontend: Deployed on Vercel.
👨‍💻 Author
GitHub: @gize22