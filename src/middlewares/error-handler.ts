import type { NextFunction, Request, Response } from "express";
import ApiError from "@/utils/api-error.js";

export default function errorHandler() {
  return (error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error('Unexpected error:', error);
    if(error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}