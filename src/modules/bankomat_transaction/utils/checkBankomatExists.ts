import { type PoolClient } from "pg";
import bcrypt from "bcrypt";
import ApiError from "@/utils/api-error.js";

export const checkBankomatPassword = async (
  client: PoolClient,
  bancomat_id: number,
  password: string,
) => {
  const bankomat = await client.query(
    `SELECT id, password_hash, transaction_limit, cash
     FROM bankomats
     WHERE id = $1`,
    [bancomat_id],
  );

  if (bankomat.rowCount === 0) {
    throw new ApiError(404, "Банкомат не найден");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    bankomat.rows[0].password_hash,
  );

  if (!isPasswordValid) {
    throw new ApiError(400, "Неверный пароль банкомата");
  }

  return bankomat.rows[0];
};
