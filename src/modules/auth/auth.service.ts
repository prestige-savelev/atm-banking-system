import { pool } from "../../config/bd.js";
import ApiError from "@/utils/api-error.js";
import bcrypt from "bcrypt";

export const getUserAuth = async (email: string, password: string) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rowCount === 0) {
      throw new ApiError(404, "Пользователь не найден");
    }

    const isMath = await bcrypt.compare(password, user.rows[0].password);

    if (!isMath) {
      throw new ApiError(401, "Пользователь не найден");
    }

    return user.rows[0];
  } catch {
    throw new ApiError(400, "Ошибка аутентификации");
  }
};
