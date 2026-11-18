import { Router } from "express";
import {
  bankAccountCreate,
  delBankAccount,
  getBankAccountBalance,
  getBankUser,
} from "./bank_account.controler.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/create", authMiddleware, bankAccountCreate);
router.get("/", authMiddleware, getBankUser);
router.post("/delete", authMiddleware, delBankAccount);
router.get("/balance", authMiddleware, getBankAccountBalance);

export default router;
