import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

// USER REGISTERING CONTROLLER
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the Fields");
  }
  // CHECKING USER EXISTENCE
  const userExist = await User.findOne({ email: email });
  if (userExist) {
    res.status(400);
    throw new Error("User already Exists.");
  }

  // Handle optional image upload
  let picUrl = req.body.pic;
  if (req.file && req.file.buffer) {
    try {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "smart-talk/profile-images",
        resource_type: "image",
      });
      picUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // CREATING THE USER
  const user = await User.create({
    name,
    email,
    password,
    pic: picUrl,
  });

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: await generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not Created.");
  }
});

// USER LOGIN CONTROLLER
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the Fields");
  }
  // GETTING THE USER
  const user = await User.findOne({ email: email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: await generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password Found");
  }
});

// SEARCH/GET ALL USER CONTROLLER (GET /api/user?search=)
const allUser = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;       // default: page 1
  const limit = parseInt(req.query.limit) || 10;    // default: 10 per page
  const skip = (page - 1) * limit;

  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  // Exclude current user
  const filter = { ...keyword, _id: { $ne: req.user._id } };

  const totalCounts = await User.countDocuments(filter);
  const hasNext = page * limit < totalCounts;

  // Fetch users, lean gives plain objects (not Mongoose docs)
  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .select({ _id: 1, name: 1, email: 1, isAdmin: 1, pic: 1 })
    .lean();

  res.status(200).json({
    data: users,
    totalCounts,
    page,
    limit,
    hasNext,
  });
});



export { registerUser, loginUser, allUser };
