import type { Request, Response } from "express";
import { asyncHandler } from "@/utils/async-handler.js";
import { getUserAuth } from "./auth.service.js";
import { responseSuccess } from "@/utils/response_builder.js";
import { generateToken } from "@/utils/generateToken.js";

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const data = await getUserAuth(req.body.email, req.body.password);
  const token = generateToken(data.id);
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json(responseSuccess("Успешная аутентификация", data));
});
