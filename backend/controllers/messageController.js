import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";
import { getOrSetCache, delCache } from "../utils/cache.js";

// SEND MESSAGE CONTROLLER
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    const currentLoggedUserId = req.user._id;

    // Validate input
    if (!content || !chatId) {
        res.status(400);
        throw new Error("Content and chatId are required.");
    }

    // Create message
    const newMessage = {
        sender: currentLoggedUserId,
        content,
        chat: chatId,
    };

    // create message doc
    let message = await Message.create(newMessage);

    // populate sender + chat + chat.users for client-friendly response
    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");
    message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
    });

    // Update Chat.latestMessage (store message._id) and get updated chat populated with users
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { latestMessage: message._id },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    // Invalidate caches:
    // 1) per-chat messages cache so next fetch rebuilds from DB
    await delCache(`chat:${chatId}:messages`);

    // 2) chats list cache for all users in the chat so sidebar/latestMessage rehydrates
    if (updatedChat && Array.isArray(updatedChat.users)) {
        updatedChat.users.forEach((u) => {
            if (u && u._id) delCache(`user:${u._id.toString()}:chats`);
        });
    }

    // Respond with created message
    res.status(201).json({
        success: true,
        message: message,
    });
});

// GET ALL CHAT MESSAGES CONTROLLER (with cache)
const getAllChatMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        res.status(400);
        throw new Error("chatId param is required.");
    }

    // Use cache key per chat
    const cacheKey = `chat:${chatId}:messages`;

    const messages = await getOrSetCache(cacheKey, async () => {
        const msgs = await Message.find({ chat: chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        return msgs;
    });

    res.status(200).json({
        success: true,
        count: Array.isArray(messages) ? messages.length : 0,
        messages: messages,
    });
});

export { sendMessage, getAllChatMessages };
