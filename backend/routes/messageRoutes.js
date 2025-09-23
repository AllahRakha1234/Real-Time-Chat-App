import express from "express";
import { sendMessage, getAllChatMessages } from "../controllers/messageController.js"

const router = express.Router();

router.get("/:chatId", getAllChatMessages); // For Sending Message
router.route("/").post(sendMessage); // For Sending Message


export default router;
