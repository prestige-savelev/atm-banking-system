import { pool } from "@/config/bd.js";
import { generateAccountNumber } from "./utils/generateAccountNumber.js";
import { generateCardNumber } from "./utils/generateCardNumber.js";
import ApiError from "@/utils/api-error.js";
import { withTransaction } from "../../utils/withTransaction.js";

// Создание банковского счёта и карты
export const bankAccountCreate = async (userId: number) => {
  return withTransaction(async (client) => {
    // Проверяем пользователя и блокируем его строку
    const user = await client.query(
      `SELECT first_name, last_name
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [userId],
    );

    if (user.rowCount === 0) {
      throw new ApiError(404, "Пользователь не найден");
    }

    // Проверяем, существует ли банковский счёт пользователя
    const bankAccount = await client.query(
      `SELECT id
       FROM bank_accounts
       WHERE user_id = $1`,
      [userId],
    );

    if (bankAccount.rowCount !== 0) {
      throw new ApiError(409, "Банковский счёт уже существует");
    }

    // Генерируем уникальные номера
    const accountNumber = generateAccountNumber();
    const cardNumber = generateCardNumber();

    // Создаём банковский счёт
    const account = await client.query(
      `INSERT INTO bank_accounts (user_id, account_number)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, accountNumber],
    );

    // Создаём карту
    const card = await client.query(
      `INSERT INTO bank_cards (card_number, card_name, bank_account_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        cardNumber,
        `${user.rows[0].first_name} ${user.rows[0].last_name}`,
        account.rows[0].id,
      ],
    );

    return {
      bankAccount: account.rows[0],
      card: card.rows[0],
    };
  });
};

// Получение банковского счёта пользователя
export const usersBank = async (id: number) => {
  const bank = await pool.query(
    `SELECT account_number
     FROM bank_accounts
     WHERE user_id = $1`,
    [id],
  );

  if (bank.rowCount === 0) {
    throw new ApiError(404, "Банковский счёт не найден");
  }

  return bank.rows[0];
};

// Удаление банковского счёта
export const deleteAccount = async (id: number) => {
  return withTransaction(async (client) => {
    // Удаляем карты пользователя
    const cards = await client.query(
      `DELETE FROM bank_cards
       WHERE bank_account_id IN (
         SELECT id
         FROM bank_accounts
         WHERE user_id = $1
       )
       RETURNING card_number`,
      [id],
    );

    // Удаляем банковский счёт
    const bankAccount = await client.query(
      `DELETE FROM bank_accounts
       WHERE user_id = $1
       RETURNING account_number`,
      [id],
    );

    if (bankAccount.rowCount === 0) {
      throw new ApiError(404, "Банковский счёт не найден");
    }

    return {
      success: true,
      deletedBankNumber: bankAccount.rows[0].account_number,
      deletedCardNumbers: cards.rows.map((el) => el.card_number),
    };
  });
};

export const bankAccountBalance = async (userId: number) => {
  const result = await pool.query(
    `SELECT
        ba.account_number,
        COALESCE(SUM(bc.cash), 0) AS balance
     FROM bank_accounts ba
     LEFT JOIN bank_cards bc ON bc.bank_account_id = ba.id
     WHERE ba.user_id = $1
     GROUP BY ba.id, ba.account_number`,
    [userId],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Банковский счёт не найден");
  }

  return result.rows[0];
};
