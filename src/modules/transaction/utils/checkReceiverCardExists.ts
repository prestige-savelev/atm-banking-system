import type { PoolClient } from "pg";
import ApiError from "@/utils/api-error.js";

export const checkReceiverCardExists = async (
  client: PoolClient,
  receiverCardNumber: string,
) => {
  const receiverCard = await client.query(
    `SELECT id, card_number, is_active
     FROM bank_cards
     WHERE card_number = $1
     FOR UPDATE`,
    [receiverCardNumber],
  );

  if (receiverCard.rowCount === 0) {
    throw new ApiError(404, "Карта получателя не найдена");
  }

  if (!receiverCard.rows[0].is_active) {
    throw new ApiError(400, "Карта получателя не активна");
  }

  return receiverCard.rows[0];
};
