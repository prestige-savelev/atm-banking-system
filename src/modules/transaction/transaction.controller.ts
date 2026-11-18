import { asyncHandler } from "@/utils/async-handler.js";
import { responseSuccess } from "@/utils/response_builder.js";
import { type Request, type Response } from "express";
import * as transactionService from "./transaction.service.js";

export const addTransfer = asyncHandler(async (req: Request, res: Response) => {
  const data = await transactionService.transfer(
    Number(req.userId),
    req.body.sender_card_number,
    req.body.receiver_card_number,
    req.body.pin,
    req.body.cash,
  );
  res.status(200).json(responseSuccess("Перевод выполнен успешно", data));
});

export const getUserTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await transactionService.getTransactions(Number(req.userId));
    res
      .status(200)
      .json(responseSuccess("История транзакций успешно получена", data));
  },
);
