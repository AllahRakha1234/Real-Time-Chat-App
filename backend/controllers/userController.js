import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
  console.log("Login attempt with email:", email, password);
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

// SEND OTP CONTROLLER
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User with this email does not exist");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP expiry (e.g., 10 minutes)
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetOtp = otp;
  user.resetOtpExpiry = expiry;

  await user.save();

  // Send OTP via email
  await sendEmail(
    email,
    "Your SmartTalk Password Reset OTP",
    `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
  );

  res.status(200).json({ message: "OTP sent to your email" });
});

// VERIFY OTP CONTROLLER
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Generate secure reset token (valid for 15 mins)
    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    return res.json({
      success: true,
      message: "OTP Verified successfully",
      resetToken,
    });

  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// RESET PASSWORD ONTROLLERS
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    res.status(400);
    throw new Error("Reset token & new password are required");
  }

  const user = await User.findOne({
    resetToken,
    resetTokenExpiry: { $gt: Date.now() }
  });

  console.log("Reset Password - Found User:", user);

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token!");
  }

  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  res.json({
    success: true,
    message: "Password reset successfully!",
  });
});




export { registerUser, loginUser, allUser, sendOtp, verifyOtp, resetPassword };
