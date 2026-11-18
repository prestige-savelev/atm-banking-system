import type { PoolClient } from "pg";
import ApiError from "@/utils/api-error.js";

export const checkBankCardExists = async (
  client: PoolClient,
  bankAccountId: number,
  cardId: number,
) => {
  const card = await client.query(
    `SELECT pin, is_active
     FROM bank_cards
     WHERE bank_account_id = $1 AND id = $2`,
    [bankAccountId, cardId],
  );

  if (card.rowCount === 0) {
    throw new ApiError(404, "Банковская карта не найдена");
  }

  return card.rows[0];
};
