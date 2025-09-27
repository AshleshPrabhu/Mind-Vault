import { Router } from "express";
import {
    getMessagesByRoom,
    likeMessage,
    dislikeMessage,
    validateMessage,
    markMessageAsRewarded,
    getMessageById
} from "../controllers/message.controller.js";

const router = Router();
router.get("/room/:roomId", getMessagesByRoom);
router.get("/:messageId", getMessageById);
router.post("/:messageId/like", likeMessage);
router.post("/:messageId/dislike", dislikeMessage);
router.post("/:messageId/validate", validateMessage);
router.post("/:messageId/reward", markMessageAsRewarded);

export default router;
