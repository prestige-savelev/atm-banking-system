import { asyncHandler } from "@/utils/async-handler.js";
import * as userServices from "./user.service.js";
import type { Request, Response } from "express";
import { responseError, responseSuccess } from "@/utils/response_builder.js";
import { generateToken } from "@/utils/generateToken.js";

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await userServices.getUserMe(Number(req.userId));
  res.status(201).json(responseSuccess("Пользователь успешно получен", data));
});

// GET /users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userServices.findAllUsers();
  res.status(200).json(responseSuccess("Users retrieved successfully", users));
});

// GET /users/:id
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json(responseError("Invalid user id"));
    return;
  }
  const user = await userServices.findUserById(id);
  res.status(200).json(responseSuccess("User retrieved successfully", user));
});

// POST /users
export const postUsers = asyncHandler(async (req: Request, res: Response) => {
  const { first_name, last_name, email, gender, age, bio, password } = req.body;
  const newUser = await userServices.createUser(
    first_name,
    last_name,
    email,
    gender,
    age,
    bio,
    password,
  );

  const token = generateToken(newUser.id);
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json(responseSuccess("User created successfully", newUser));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await userServices.delUser(Number(req.userId));
  res.status(201).json(responseSuccess("Пользователь успешно удалён", data));
});
