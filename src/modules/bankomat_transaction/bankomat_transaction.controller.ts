import { asyncHandler } from "@/utils/async-handler.js";
import { type Request, type Response } from "express";
import * as bankomatTransactionService from "./bankomat_transaction.service.js";
import { responseSuccess } from "@/utils/response_builder.js";

export const getBankomatTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { card_id, pin, bankomat_id, password } = req.body;

    const data = await bankomatTransactionService.bankomatTransactions(
      Number(card_id),
      pin,
      bankomat_id,
      password,
    );

    res
      .status(200)
      .json(responseSuccess("История транзакций успешно получена", data));
  },
);
export const addDeposit = asyncHandler(async (req: Request, res: Response) => {
  const { card_id, bankomat_id, pin, password, cash } = req.body;
  const data = await bankomatTransactionService.deposit(
    card_id,
    bankomat_id,
    pin,
    password,
    cash,
  );
  res
    .status(200)
    .json(responseSuccess("Средства успешно зачислены на счёт", data));
});

export const addWithdraw = asyncHandler(async (req: Request, res: Response) => {
  const { card_id, bankomat_id, pin, password, cash } = req.body;
  const data = await bankomatTransactionService.withdraw(
    card_id,
    bankomat_id,
    pin,
    password,
    cash,
  );
  res.status(200).json(responseSuccess("Выдача наличных прошла успешно", data));
});
