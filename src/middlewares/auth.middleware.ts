import ApiError from "@/utils/api-error.js";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new ApiError(401, "Не авторизован");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    (req as Request & { userId: number }).userId = (
      decoded as jwt.JwtPayload
    ).userId;

    next();
  } catch (err) {
    next(new ApiError(401, "Недействительный токен"));
  }
};
