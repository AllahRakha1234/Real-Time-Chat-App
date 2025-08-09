import express from "express";
import {
  registerUser,
  loginUser,
  allUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect, allUser);
// Accept multipart form with optional image
router.route("/").post(uploadSingleImage, registerUser);
router.post("/login", loginUser);

export default router;
