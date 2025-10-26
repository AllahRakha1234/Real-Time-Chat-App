import express from "express";
import {
  registerUser,
  loginUser,
  allUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../validations/validateRequest.js";
import { registerUserValidation, loginUserValidation } from "../validations/user.validations.js";

const router = express.Router();

router.get("/", protect, allUser);
// Accept multipart form with optional image
router.route("/").post(uploadSingleImage, registerUserValidation, validateRequest, registerUser);
router.post("/login", loginUserValidation, validateRequest, loginUser);

export default router;
