import { Router } from "express";
import {
    createChatRoomEndpoint,
    getChatRoomById
} from "../controllers/chatroom.controller.js";

const router = Router();

router.post("/", createChatRoomEndpoint);
router.get("/:roomId", getChatRoomById);

export default router;