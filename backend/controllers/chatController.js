import asyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// ACCESSING/CREATING CHAT (1-TO-1)
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.status(400).send({ message: "UserId param is required" });
  }

  // Check if chat already exists
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return res.send(isChat[0]);
  }

  // If no chat exists, create a new one
  const chatData = {
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  };

  try {
    const createdChat = await Chat.create(chatData);
    const FullChat = await Chat.findOne({ _id: createdChat._id })
      .populate("users", "-password");
    return res.status(200).json(FullChat);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// FETCH CHATS
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const fullChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    return res.status(200).send(fullChats);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// CREATE GROUP CHAT
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  let users;
  try {
    users = JSON.parse(req.body.users);
  } catch (err) {
    return res.status(400).send({ message: "Invalid users format" });
  }

  if (users.length < 2) {
    return res.status(400).send({
      message: "More than 2 users are required to form a group chat",
    });
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroupChat);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// RENAME GROUP CHAT
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).send({ message: "Chat ID and chat name are required" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).send({ message: "Chat not found" });
    }

    return res.status(200).json(updatedChat);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// ADD TO GROUP
const addToGroup = asyncHandler(async (req, res)=>{
  const {chatId, userId} = req.body
  if(!chatId || !userId){
    return res.status(400).send({message: "Chat ID and User ID are required"})
  }

  const added = await Chat.findByIdAndUpdate(chatId, {
    $push: {users: userId}
  }, {new: true}).populate("users", "-password").populate("groupAdmin", "-password")

  if(!added){
    return res.status(400).send({message: "Failed to add user to group"})
  }
  res.status(200).json(added)
})

// REMOVE FROM GROUP
const removeFromGroup = asyncHandler(async (req, res)=>{
  const {chatId, userId} = req.body
  if(!chatId || !userId){
    return res.status(400).send({message: "Chat ID and User ID are required"})
  }

  const removed = await Chat.findByIdAndUpdate(chatId, {
    $pull: {users: userId}
  }, {new: true}).populate("users", "-password").populate("groupAdmin", "-password")

  if(!removed){
    return res.status(400).send({message: "Failed to remove user from group"})
  }
  res.status(200).json(removed)
})

export { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };
