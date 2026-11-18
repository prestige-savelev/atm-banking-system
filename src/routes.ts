import userRouter from "./modules/users/user.routes.js";
import bankAccountRouter from "./modules/bank_account/bank_account.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import cardRouter from "./modules/bank_cards/bank_cards.routes.js";
import transactionRouter from "./modules/transaction/transaction.routes.js";
import bankomatTransactionRouter from "./modules/bankomat_transaction/bankomat_transaction.routes.js";
import { Router } from "express";

const router = Router();

router.use("/users", userRouter);
router.use("/bank_account", bankAccountRouter);
router.use("/user", authRouter);
router.use("/card", cardRouter);
router.use("/transaction", transactionRouter);
router.use("/bankomat_transaction", bankomatTransactionRouter);

export default router;
