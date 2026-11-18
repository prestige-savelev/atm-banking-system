import { Router } from "express";
import { signIn } from "./auth.controller.js";

const router = Router();

router.post("/auth", signIn);

export default router;
