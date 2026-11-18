import { Router } from "express";
import {
  getUserById,
  getUsers,
  postUsers,
  deleteUser,
  getUser,
} from "./user.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authMiddleware, getUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", postUsers);
router.post("/delete", authMiddleware, deleteUser);

export default router;
