import ApiError from "@/utils/api-error.js";
import { checkBankAccountExists } from "@/utils/checkBankAccountExists.js";
import { checkBankCardExists } from "@/utils/checkBankCardExists.js";
import { checkUserExists } from "@/utils/checkUserExists.js";
import { withTransaction } from "@/utils/withTransaction.js";
import bcrypt from "bcrypt";
import { checkCardPin } from "./utils/checkCardPinExists.js";
import { checkBankomatPassword } from "./utils/checkBankomatExists.js";

export const bankomatTransactions = async (
  card_id: number,
  pin: string,
  bancomat_id: number,
  password: string,
) => {
  return await withTransaction(async (client) => {
    // Проверяем карту
    const card = await checkCardPin(client, card_id, pin);

    // Проверяем банкомат
    const bankomat = await checkBankomatPassword(client, bancomat_id, password);

    // Получаем историю транзакций
    const transactions = await client.query(
      `SELECT *
       FROM bankomat_transactions
       WHERE card_id = $1
         AND bankomat_id = $2
       ORDER BY id DESC`,
      [card_id, bancomat_id],
    );

    return { transactions: transactions.rows };
  });
};

export const deposit = async (
  card_id: number,
  bankomat_id: number,
  pin: string,
  password: string,
  cash: number,
) => {
  return await withTransaction(async (client) => {
    // Проверяем сумму
    if (!Number.isFinite(cash) || cash <= 0) {
      throw new ApiError(400, "Некорректная сумма пополнения");
    }

    // Проверяем карту
    const card = await checkCardPin(client, card_id, pin);

    // Проверяем банкомат
    const bankomat = await checkBankomatPassword(client, bankomat_id, password);

    if (cash > Number(bankomat.transaction_limit)) {
      throw new ApiError(
        405,
        `Превышен лимит операции банкомата до ${bankomat.transaction_limit}!`,
      );
    }

    // Проверяем наличие денег в банкомате
    if (Number(bankomat.cash) < cash) {
      throw new ApiError(400, "В банкомате недостаточно наличных");
    }

    // Списываем деньги с банкомата
    const updatedBankomat = await client.query(
      `UPDATE bankomats
       SET cash = cash - $1
       WHERE id = $2
       RETURNING cash`,
      [cash, bankomat_id],
    );

    // Зачисляем деньги на карту
    const updatedCard = await client.query(
      `UPDATE bank_cards
       SET cash = cash + $1
       WHERE id = $2
       RETURNING cash`,
      [cash, card_id],
    );

    // Создаём запись о транзакции
    const transaction = await client.query(
      `INSERT INTO bankomat_transactions
       (card_id, bankomat_id, transaction_type, cash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [card_id, bankomat_id, "deposit", cash],
    );

    return {
      transaction: transaction.rows[0],
    };
  });
};

export const withdraw = async (
  card_id: number,
  bankomat_id: number,
  pin: string,
  password: string,
  cash: number,
) => {
  return await withTransaction(async (client) => {
    // Проверяем сумму
    if (!Number.isFinite(cash) || cash <= 0) {
      throw new ApiError(400, "Некорректная сумма снятия");
    }

    // Проверяем карту
    const card = await checkCardPin(client, card_id, pin);

    // Проверяем банкомат
    const bankomat = await checkBankomatPassword(client, bankomat_id, password);

    // Проверяем наличие денег на карте
    if (Number(card.cash) < cash) {
      throw new ApiError(400, "На карте недостаточно средств");
    }

    // Проверяем лимит банкомата
    if (cash > Number(bankomat.transaction_limit)) {
      throw new ApiError(
        400,
        `Превышен лимит операции. Максимальная сумма: ${bankomat.transaction_limit}`,
      );
    }

    // Списываем деньги с карты
    await client.query(
      `UPDATE bank_cards
       SET cash = cash - $1
       WHERE id = $2`,
      [cash, card_id],
    );

    // Начисляем деньги банкомату
    await client.query(
      `UPDATE bankomats
       SET cash = cash + $1
       WHERE id = $2`,
      [cash, bankomat_id],
    );

    // Создаём запись о транзакции
    const transaction = await client.query(
      `INSERT INTO bankomat_transactions
       (card_id, bankomat_id, transaction_type, cash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [card_id, bankomat_id, "withdrawal", cash],
    );

    return {
      transaction: transaction.rows[0],
    };
  });
};
