import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from "./config/conn.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddlewares.js";
import { protect } from "./middlewares/authMiddleware.js";
import cors from "cors"
import { configureCloudinary } from "./config/cloudinary.js";

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Configure Cloudinary after environment variables are loaded
configureCloudinary();

connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // To accept the json data

// Allowing the Origins
app.use(cors({
  origin: ["http://localhost:5173"], // React dev server
  credentials: true, // allow cookies or auth headers
}));

app.use("/api/user", userRoutes);
app.use("/api/chat", protect, chatRoutes);

// MIDDLEWARES
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`.magenta.bold);
});
