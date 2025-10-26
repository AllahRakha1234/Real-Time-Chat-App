import express from "express";
import { sendMessage, getAllChatMessages } from "../controllers/messageController.js"
import { getAllChatMessagesValidation } from "../validations/message.validation.js";
import { validateRequest } from "../validations/validateRequest.js";

const router = express.Router();

router.get("/:chatId", getAllChatMessagesValidation, validateRequest, getAllChatMessages); // For Getting All Message of a Chat
router.route("/").post(sendMessage); // For Sending Message


export default router;
