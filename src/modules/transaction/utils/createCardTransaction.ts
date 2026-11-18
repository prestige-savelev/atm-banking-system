import type { PoolClient } from "pg";
import ApiError from "@/utils/api-error.js";
import crypto from "crypto";

export const createCardTransaction = async (
  client: PoolClient,
  senderCardNumber: string,
  receiverCardNumber: string,
  cash: number,
) => {
  const hashTransaction = crypto.randomUUID();

  const transaction = await client.query(
    `INSERT INTO card_transactions (
        hash_transaction,
        sender_card_number,
        receiver_card_number,
        cash
     )
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [hashTransaction, senderCardNumber, receiverCardNumber, cash],
  );

  if (transaction.rowCount === 0) {
    throw new ApiError(500, "Не удалось создать транзакцию");
  }

  return transaction.rows[0];
};
