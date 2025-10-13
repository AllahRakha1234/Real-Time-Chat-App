import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./config/conn.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddlewares.js";
import { protect } from "./middlewares/authMiddleware.js";
import cors from "cors";
import { configureCloudinary } from "./config/cloudinary.js";
import logger from "./config/logger/index.js";
import morganMiddleware from "./config/logger/morgan.js";
import { Server } from "socket.io";

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

// Configure Cloudinary after environment variables are loaded
configureCloudinary();

connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Logging
app.use(morganMiddleware);

app.use(express.json()); // To accept the json data

// Allowing the Origins
app.use(
  cors({
    origin: ["http://localhost:5173"], // React dev server
    credentials: true, // allow cookies or auth headers
  })
);

app.use("/api/user", userRoutes);
app.use("/api/chat", protect, chatRoutes);
app.use("/api/messages", protect, messageRoutes);


// Default Route
app.get("/", (req, res) => {
  res.send("🚀 API is running... use /health for status check");
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(), // how long the server has been running
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
  });
});


// MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port} in ${process.env.NODE_ENV} mode`.magenta.bold);
});

// SOCKET.IO SETUP

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {

  socket.on("setup", (userData) => {
    socket.join(userData._id)
    console.log("User connected to socket: ", userData._id)
    socket.emit("connected")
  })

  socket.on("join-chat", (roomId) => {
    console.log("User joined room: ", roomId)
    socket.join(roomId)
  })

  socket.on("new-message", (newMessage) => {
    let chatId = newMessage.chat._id
    if (!chatId) {
      console.log("No chatId in the new message")
      return
    }
    if (!newMessage.chat.users) {
      console.log("No users in the chat")
      return
    }

    newMessage.chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
      socket.to(user._id).emit("message-received", newMessage) // can use "in" as well as "to"
    })
  })

  socket.on("typing", ({chatId, user}) => {
    socket.in(chatId).emit("typing", {chatId ,user});
  });

  socket.on("stop-typing", (chatId) => {
    socket.in(chatId).emit("stop-typing", chatId);
  });

});

