import express from "express";
import { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(accessChat);
router.route("/").get(fetchChats);
router.route("/group").post(createGroupChat);
router.route("/group-rename").post(renameGroup);
router.route("/group-add").post(addToGroup);
router.route("/group-remove").post(removeFromGroup);

export default router;
