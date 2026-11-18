import { asyncHandler } from "@/utils/async-handler.js";
import { responseSuccess } from "@/utils/response_builder.js";
import * as BankAccountService from "./bank_account.service.js";
import express, { type Request, type Response } from "express";

export const bankAccountCreate = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await BankAccountService.bankAccountCreate(Number(req.userId));

    res
      .status(200)
      .json(responseSuccess("Банковский счет и карта успешно созданы", data));
  },
);

export const getBankUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await BankAccountService.usersBank(Number(req.userId));
  res
    .status(200)
    .json(responseSuccess("Банковский счет успешно получен", data));
});

export const delBankAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await BankAccountService.deleteAccount(Number(req.userId));
    res
      .status(200)
      .json(responseSuccess("Банковский счёт удалён успешно", data));
  },
);

export const getBankAccountBalance = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await BankAccountService.bankAccountBalance(
      Number(req.userId),
    );
    res
      .status(200)
      .json(responseSuccess("Баланс банковского счёта успешно получен", data));
  },
);
