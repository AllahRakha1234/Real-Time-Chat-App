import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import connectDB from "./config/conn.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddlewares.js";
import { protect } from "./middlewares/authMiddleware.js";

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // To accept the json data

app.use("/api/user", userRoutes);
app.use("/api/chat", protect, chatRoutes);

// MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`.magenta.bold);
});
