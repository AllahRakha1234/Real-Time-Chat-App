import express from "express";
import { accessChat } from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(accessChat);

export default router;
