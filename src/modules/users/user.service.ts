import { pool } from "../../config/bd.js";
import ApiError from "@/utils/api-error.js";
import { withTransaction } from "../../utils/withTransaction.js";
import bcrypt from "bcrypt";

// Получение текущего пользователя
export const getUserMe = async (id: number) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, age, bio
     FROM users
     WHERE id = $1`,
    [id],
  );

  return result.rows[0];
};

// Получение всех пользователей
export const findAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, age, bio
     FROM users`,
  );

  return result.rows;
};

// Создание нового пользователя
export const createUser = async (
  first_name: string,
  last_name: string,
  email: string,
  gender: string,
  age: number,
  bio: string,
  password: string,
) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (
        first_name,
        last_name,
        email,
        gender,
        age,
        bio,
        password
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [first_name, last_name, email, gender, age, bio, hashedPassword],
    );

    return result.rows[0];
  } catch (error) {
    throw new ApiError(
      500,
      "Не получилось создать пользователя, попробуйте позже",
    );
  }
};

// Получение пользователя по ID
export const findUserById = async (id: number) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, age, bio
     FROM users
     WHERE id = $1`,
    [id],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "User not found");
  }

  return result.rows[0];
};

// Удаление пользователя
export const delUser = async (id: number) => {
  return withTransaction(async (client) => {
    // Проверяем пользователя и блокируем его строку
    const user = await client.query(
      `SELECT id
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [id],
    );

    if (user.rowCount === 0) {
      throw new ApiError(404, "Пользователь не найден");
    }

    // Удаляем карты
    await client.query(
      `DELETE FROM bank_cards
       WHERE bank_account_id IN (
         SELECT id
         FROM bank_accounts
         WHERE user_id = $1
       )`,
      [id],
    );

    // Удаляем банковские счета
    await client.query(
      `DELETE FROM bank_accounts
       WHERE user_id = $1`,
      [id],
    );

    // Удаляем пользователя
    const result = await client.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id`,
      [id],
    );

    return {
      success: true,
      deletedUserId: result.rows[0].id,
    };
  });
};
