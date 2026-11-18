import ApiError from "@/utils/api-error.js";
import type { PoolClient } from "pg";

export const checkUserExists = async (client: PoolClient, userId: number) => {
  const result = await client.query(
    `SELECT id
     FROM users
     WHERE id = $1`,
    [userId],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Пользователь не найден");
  }

  return result.rows[0];
};
