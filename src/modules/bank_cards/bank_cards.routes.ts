import { Router } from "express";
import {
  activationCard,
  addNewCard,
  deactivationCard,
  deleteCard,
  getBalanse,
  getCard,
  postPinCard,
} from "./bank_cards.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/balance/:id", authMiddleware, getBalanse);
router.get("/", authMiddleware, getCard);
router.post("/pin", authMiddleware, postPinCard);
router.post("/add", authMiddleware, addNewCard);
router.post("/delete/:id", authMiddleware, deleteCard);
router.post("/deactivation/:id", authMiddleware, deactivationCard);
router.post("/activation/:id", authMiddleware, activationCard);

export default router;
