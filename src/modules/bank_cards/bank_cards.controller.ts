import { asyncHandler } from "@/utils/async-handler.js";
import { response, type Request, type Response } from "express";
import * as cardService from "./bank_cards.service.js";
import { responseSuccess } from "@/utils/response_builder.js";

export const getCard = asyncHandler(async (req: Request, res: Response) => {
  const data = await cardService.getBankCards(Number(req.userId));
  res.status(200).json(responseSuccess("Карта успешно получена", data));
});

export const postPinCard = asyncHandler(async (req: Request, res: Response) => {
  const data = await cardService.changePin(
    req.body.card_id,
    req.body.pin,
    Number(req.userId),
  );
  res.status(200).json(responseSuccess("Пин код успешно изменён", data));
});

export const addNewCard = asyncHandler(async (req: Request, res: Response) => {
  const data = await cardService.addCard(Number(req.userId), req.body.pin);
  res.status(200).json(responseSuccess("Карта создана", data));
});

export const getBalanse = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = await cardService.getUserBalanseCard(
    Number(req.userId),
    req.body.pin,
    id,
  );
  res.status(200).json(responseSuccess("Балас успешно получен", data));
});

export const deleteCard = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = await cardService.delCard(Number(req.userId), req.body.pin, id);
  res.status(200).json(responseSuccess("Карта удалена", data));
});

export const deactivationCard = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await cardService.deactivCard(
      Number(req.userId),
      req.body.pin,
      id,
    );
    res.status(200).json(responseSuccess("Карта деактивирована", data));
  },
);

export const activationCard = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const data = await cardService.activCard(
      Number(req.userId),
      req.body.pin,
      id,
    );

    res.status(200).json(responseSuccess("Карта активирована", data));
  },
);
