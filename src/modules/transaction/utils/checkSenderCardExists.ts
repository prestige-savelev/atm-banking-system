import type { PoolClient } from "pg";
import ApiError from "@/utils/api-error.js";
import bcrypt from "bcrypt";

export const checkSenderCardExists = async (
  client: PoolClient,
  bankAccountId: number,
  senderCardNumber: string,
  pin: string,
  cash: number,
) => {
  const senderCard = await client.query(
    `SELECT id, card_number, pin, is_active, cash
     FROM bank_cards
     WHERE bank_account_id = $1 AND card_number = $2
     FOR UPDATE`,
    [bankAccountId, senderCardNumber],
  );

  if (senderCard.rowCount === 0) {
    throw new ApiError(404, "Карта отправителя не найдена");
  }

  const {
    id: senderCardId,
    pin: hashedPin,
    is_active,
    cash: senderCash,
  } = senderCard.rows[0];

  if (!is_active) {
    throw new ApiError(400, "Карта отправителя не активна");
  }

  const isPinValid = await bcrypt.compare(pin, hashedPin);

  if (!isPinValid) {
    throw new ApiError(400, "Неверный PIN-код");
  }

  if (Number(senderCash) < cash) {
    throw new ApiError(402, "Недостаточно средств");
  }

  return senderCard.rows[0];
};
