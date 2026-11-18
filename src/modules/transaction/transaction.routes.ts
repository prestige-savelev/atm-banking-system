import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { Router } from "express";
import { addTransfer, getUserTransactions } from "./transaction.controller.js";

const router = Router();

router.post("/transfer", authMiddleware, addTransfer);
router.get("/", authMiddleware, getUserTransactions);

export default router;
