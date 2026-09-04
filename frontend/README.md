# P2P Learn - Frontend

This is the frontend client for **P2P Learn**, a next-generation peer-to-peer learning platform designed for university students to teach, learn, collaborate in study groups, and connect seamlessly.

## 🚀 Features
- **User Authentication:** Secure registration and login with Email OTP verification.
- **Role-Based Dashboards:** Dedicated dashboards for students and system administrators.
- **Smart Matching System:** Connects learners with peers based on skills to teach and learn.
- **Real-Time Chat:**  1-to-1 private messaging and study group chats powered by Socket.io.
- **Dark/Light Mode:** Seamless theme switcher across all pages.
- **Community Forum & Q&A:** Platform to post technical questions and get answers from peers.

## 🛠️ Tech Stack
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Real-Time Communication:** Socket.io-client
- **HTTP Client:** Axios

## 📦 Getting Started Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/P2P.git

2,Navigate to the frontend directory:
    cd P2P/frontend

3, Install dependencies:
   npm install

4, Create a .env file in the root of the frontend folder and add your     configuration (e.g., API base URL):
   VITE_API_URL=http://localhost:5000/api

5, Run the development server:
   npm run dev

6, Deployment
   The frontend is deployed and live on Vercel.