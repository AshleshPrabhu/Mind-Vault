import { Router } from "express";
import {
    usersignuporlogin,
    getHistory,
    getPrivateChats,
    getPaymentHistory,
    setPaymentHistory,
    getCommunityRank,
    getLeaderboard
} from "../controllers/user.controller.js";

const router = Router();

router.post("/auth", usersignuporlogin);
router.post("/history", getHistory);
router.post("/private-chats", getPrivateChats);
router.post("/payment-history", getPaymentHistory);
router.post("/set-payment", setPaymentHistory);
router.get("/rank/:address", getCommunityRank);
router.get("/leaderboard", getLeaderboard);

export default router;
