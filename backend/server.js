const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const groupRoutes = require("./routes/groupRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Message = require("./models/Message");
const groupInviteRoutes = require("./routes/groupInviteRoutes");
const questionRoutes = require("./routes/questionRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// io ን ለ routes ማስተላለፍ እንዲቻል ማስቀመጥ
app.set("io", io);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/group-invites", groupInviteRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes);


// Socket.IO Real-time Connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ሩም መቀላቀል
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

 // ግሩፕ ቻት መልእክት ሲላክ
  socket.on("send_message", async (data) => {
    try {
      const { sender, receiver, groupId, message } = data;
      console.log("--> Trying to save message:", data); // 👈 ዴታው መምጣቱን እንይ

      if (!groupId) {
        console.log("Error: groupId is missing!");
        return;
      }

      // ዳታቤዝ ውስጥ መመዝገብ
      let newMessage = await Message.create({ 
        sender, 
        receiver: receiver || null, 
        groupId, 
        message 
      });

      newMessage = await newMessage.populate("sender", "name");
      console.log("--> Message saved successfully to DB!", newMessage._id);

      if (groupId) {
        io.to(groupId).emit("receive_message", newMessage);
      }
    } catch (error) {
      console.error("--> CRITICAL DB SAVE ERROR:", error.message); // 👈 ኤረሩን በግልጽ ያሳየናል
    }
  });

  // 1-to-1 (Private) ቻት መልእክት ሲላክ
  socket.on("send_private_message", async (data) => {
    try {
      const { sender, receiver, room, message } = data;
      const newMessage = await Message.create({ sender, receiver, message });

      // 1. ለቻት ሩሙ መልእክቱን መድረስ
      io.to(room).emit("receive_message", newMessage);

      // 2. ተቀባዩ ቻት ውስጥ ባይሆንም እንኳ ኖቲፊኬሽን እንዲደርሰው
      io.to(receiver.toString()).emit("receive_notification", {
        sender,
        message,
        type: "private_chat"
      });

    } catch (error) {
      console.error("Private message save error:", error);
    }
  });

  // መልእክቶች መታየታቸውን (Seen/Read) ወደ true መቀየር
  socket.on("mark_messages_read", async ({ sender, receiver }) => {
    try {
      // sender = መልእክቱን የላከው (ለምሳሌ a)
      // receiver = ያነበበው/ከፍቶ ያየው (ለምሳሌ b)
      await Message.updateMany(
        { sender: sender, receiver: receiver, read: false },
        { $set: { read: true } }
      );
      
      // መልእክቱን ላኪው (sender - a) የቲክ ምልክቱ ሰማያዊ እንዲሆንለት ማሳወቅ
      io.to(sender.toString()).emit("messages_read", { reader: receiver });
    } catch (error) {
      console.error("Mark read error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// MongoDB Connection & Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

app.get("/", (req, res) => {
  res.send("Peer Learning Platform API is running");
});