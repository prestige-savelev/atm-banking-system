import { type PoolClient } from "pg";
import bcrypt from "bcrypt";
import ApiError from "@/utils/api-error.js";

export const checkCardPin = async (
  client: PoolClient,
  card_id: number,
  pin: string,
) => {
  const card = await client.query(
    `SELECT id, pin, cash
     FROM bank_cards
     WHERE id = $1`,
    [card_id],
  );

  if (card.rowCount === 0) {
    throw new ApiError(404, "Банковская карта не найдена");
  }

  const isPinValid = await bcrypt.compare(pin, card.rows[0].pin);

  if (!isPinValid) {
    throw new ApiError(400, "Неверный PIN-код");
  }

  return card.rows[0];
};
