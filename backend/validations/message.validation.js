import { param } from "express-validator";
import mongoose from "mongoose";

export const getAllChatMessagesValidation = [
  param("chatId")
    .notEmpty().withMessage("chatId is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid chatId"),
];