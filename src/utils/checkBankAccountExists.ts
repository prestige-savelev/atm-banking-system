import ApiError from "./api-error.js";
import type { PoolClient } from "pg";

export const checkBankAccountExists = async (
  client: PoolClient,
  userId: number,
) => {
  const bankAccount = await client.query(
    `SELECT id
         FROM bank_accounts
         WHERE user_id = $1`,
    [userId],
  );

  if (bankAccount.rowCount === 0) {
    throw new ApiError(404, "Банковский счёт отсутствует");
  }

  return bankAccount.rows[0];
};
