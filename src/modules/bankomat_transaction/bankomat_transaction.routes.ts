import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { Router } from "express";
import {
  addDeposit,
  addWithdraw,
  getBankomatTransactions,
} from "./bankomat_transaction.controller.js";
const router = Router();

router.get("/", getBankomatTransactions);
router.post("/deposit", addDeposit);
router.post("/withdraw", addWithdraw);

export default router;
