import express from "express";
import { sendMessage, getAllChatMessages } from "../controllers/messageController.js"

const router = express.Router();

router.get("/:chatId", getAllChatMessages); // For Getting All Message of a Chat
router.route("/").post(sendMessage); // For Sending Message


export default router;
