import ApiError from "@/utils/api-error.js";
import { checkBankAccountExists } from "@/utils/checkBankAccountExists.js";
import { checkUserExists } from "@/utils/checkUserExists.js";
import { withTransaction } from "@/utils/withTransaction.js";

import { checkReceiverCardExists } from "./utils/checkReceiverCardExists.js";
import { checkSenderCardExists } from "./utils/checkSenderCardExists.js";
import { createCardTransaction } from "./utils/createCardTransaction.js";

export const transfer = async (
  id: number,
  sender_card_number: string,
  receiver_card_number: string,
  pin: string,
  cash: number,
) => {
  return await withTransaction(async (client) => {
    // Проверяем сумму
    if (!Number.isFinite(cash) || cash <= 0) {
      throw new ApiError(400, "Некорректная сумма перевода");
    }

    // Проверяем, что карты разные
    if (sender_card_number === receiver_card_number) {
      throw new ApiError(400, "Нельзя перевести деньги на свою карту");
    }

    // Проверяем пользователя
    await checkUserExists(client, id);

    // Проверяем банковский счёт
    const bankAccount = await checkBankAccountExists(client, id);

    // Проверяем карту отправителя
    const senderCard = await checkSenderCardExists(
      client,
      bankAccount.id,
      sender_card_number,
      pin,
      cash,
    );

    // Проверяем карту получателя
    const receiverCard = await checkReceiverCardExists(
      client,
      receiver_card_number,
    );

    // Списываем деньги
    await client.query(
      `UPDATE bank_cards
       SET cash = cash - $1
       WHERE id = $2`,
      [cash, senderCard.id],
    );

    // Пополняем карту получателя
    await client.query(
      `UPDATE bank_cards
       SET cash = cash + $1
       WHERE id = $2`,
      [cash, receiverCard.id],
    );

    // Создаём запись о переводе
    const transaction = await createCardTransaction(
      client,
      sender_card_number,
      receiver_card_number,
      cash,
    );

    return { transaction };
  });
};

export const getTransactions = async (id: number) => {
  return await withTransaction(async (client) => {
    // Проверяем пользователя
    await checkUserExists(client, id);

    // Проверяем банковский счёт
    const bankAccount = await checkBankAccountExists(client, id);

    // Получаем карты банковского счёта
    const cards = await client.query(
      `SELECT card_number
       FROM bank_cards
       WHERE bank_account_id = $1`,
      [bankAccount.id],
    );

    // Получаем транзакции
    const transactions = await client.query(
      `SELECT id, sender_card_number, receiver_card_number, cash, created_at
       FROM card_transactions
       WHERE sender_card_number = ANY($1)
          OR receiver_card_number = ANY($1)
       ORDER BY id DESC`,
      [cards.rows.map((card) => card.card_number)],
    );

    return { transactions: transactions.rows };
  });
};
