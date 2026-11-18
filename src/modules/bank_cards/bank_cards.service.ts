import { pool } from "@/config/bd.js";
import ApiError from "@/utils/api-error.js";
import { generateCardNumberOnCreateCard } from "./utils/generateCardNumberOnCreateCard.js";
import { isValidPin } from "./utils/validatePin.js";
import { checkUserExists } from "../../utils/checkUserExists.js";
import { withTransaction } from "../../utils/withTransaction.js";
import bcrypt from "bcrypt";

// Получаем банковские карты пользователя
export const getBankCards = async (userId: number) => {
  const result = await pool.query(
    `SELECT
        bc.id,
        bc.card_number,
        bc.card_name,
        bc.cash,
        bc.is_active
     FROM bank_accounts ba
     JOIN bank_cards bc ON bc.bank_account_id = ba.id
     WHERE ba.user_id = $1`,
    [userId],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Банковская карта не найдена");
  }

  return result.rows;
};

// Изменение PIN-кода и активация карты
export const changePin = async (
  card_id: string,
  pin: string,
  userId: number,
) => {
  return withTransaction(async (client) => {
    // Проверяем карту и её принадлежность пользователю
    const card = await client.query(
      `SELECT
          bc.id,
          bc.card_number,
          bc.card_name,
          bc.cash,
          bc.is_active
       FROM bank_accounts ba
       JOIN bank_cards bc ON bc.bank_account_id = ba.id
       WHERE ba.user_id = $1 AND bc.id = $2
       FOR UPDATE OF bc`,
      [userId, card_id],
    );

    if (card.rowCount === 0) {
      throw new ApiError(404, "Банковская карта не найдена");
    }

    // Проверяем PIN
    if (!isValidPin(pin)) {
      throw new ApiError(400, "PIN должен состоять из 4 цифр");
    }

    // Хешируем PIN
    const hashPin = await bcrypt.hash(pin, 10);

    // Обновляем PIN и активируем карту
    await client.query(
      `UPDATE bank_cards
       SET pin = $1, is_active = true
       WHERE id = $2`,
      [hashPin, card_id],
    );

    return {};
  });
};

// Создание банковской карты
export const addCard = async (id: number, pin?: string) => {
  try {
    return await withTransaction(async (client) => {
      // Проверяем пользователя
      const user = await checkUserExists(client, id);

      // Проверяем банковский счёт и блокируем его
      const bankAccount = await client.query(
        `SELECT id
         FROM bank_accounts
         WHERE user_id = $1
         FOR UPDATE`,
        [id],
      );

      if (bankAccount.rowCount === 0) {
        throw new ApiError(409, "Отсутствует банковский счёт");
      }

      // Валидируем PIN
      if (pin && !isValidPin(pin)) {
        throw new ApiError(400, "PIN должен состоять из 4 цифр");
      }

      // Проверяем лимит карт (не больше 5)
      const cardsCount = await client.query(
        `SELECT COUNT(*) AS count
         FROM bank_cards
         WHERE bank_account_id = $1`,
        [bankAccount.rows[0].id],
      );

      if (Number(cardsCount.rows[0].count) >= 5) {
        throw new ApiError(403, "Достигнут лимит карт (максимум 5)");
      }

      // Генерируем номер карты
      const cardNumber = generateCardNumberOnCreateCard();

      // Формируем данные для создания карты
      const columns: string[] = ["card_number", "card_name", "bank_account_id"];

      const values: (string | number | boolean)[] = [
        cardNumber,
        `${user.first_name} ${user.last_name}`,
        bankAccount.rows[0].id,
      ];

      // Добавляем PIN, если он передан
      if (pin) {
        const hashPin = await bcrypt.hash(pin, 10);

        columns.push("pin", "is_active");
        values.push(hashPin, true);
      }

      const query = `
        INSERT INTO bank_cards (${columns.join(", ")})
        VALUES (${values.map((_, index) => `$${index + 1}`).join(", ")})
        RETURNING *
      `;

      const card = await client.query(query, values);

      return card.rows[0];
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Системная ошибка при создании карты:", error);
    throw new ApiError(500, "Ошибка создания карты");
  }
};

// Получение баланса карты
export const getUserBalanseCard = async (
  id: number,
  pin: string,
  card_id: number,
) => {
  try {
    return await withTransaction(async (client) => {
      // Проверяем пользователя
      await checkUserExists(client, id);

      // Проверяем банковский счёт
      const bankAccount = await client.query(
        `SELECT id
         FROM bank_accounts
         WHERE user_id = $1`,
        [id],
      );

      if (bankAccount.rowCount === 0) {
        throw new ApiError(404, "Банковский счёт отсутствует");
      }

      // Получаем карту
      const card = await client.query(
        `SELECT pin, is_active
         FROM bank_cards
         WHERE bank_account_id = $1 AND id = $2`,
        [bankAccount.rows[0].id, card_id],
      );

      if (card.rowCount === 0) {
        throw new ApiError(404, "Банковская карта не найдена");
      }

      // Проверяем активность карты
      if (!card.rows[0].is_active) {
        throw new ApiError(
          402,
          "Банковская карта не активна, активируйте чтобы начать пользоваться",
        );
      }

      // Проверяем PIN
      const isValid = await bcrypt.compare(pin, card.rows[0].pin);

      if (!isValid) {
        throw new ApiError(403, "Неверный PIN-код");
      }

      // Получаем баланс
      const result = await client.query(
        `SELECT COALESCE(SUM(cash), 0) AS balance
         FROM bank_cards
         WHERE bank_account_id = $1 AND id = $2`,
        [bankAccount.rows[0].id, card_id],
      );

      return result.rows[0];
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Ошибка получения баланса");
  }
};

// Удаление карты
export const delCard = async (userId: number, pin: string, card_id: number) => {
  try {
    return await withTransaction(async (client) => {
      // Проверяем пользователя
      await checkUserExists(client, userId);

      // Проверяем карту и её принадлежность пользователю
      const card = await client.query(
        `SELECT bc.id, bc.pin
         FROM bank_accounts ba
         JOIN bank_cards bc ON bc.bank_account_id = ba.id
         WHERE ba.user_id = $1 AND bc.id = $2
         FOR UPDATE OF bc`,
        [userId, card_id],
      );

      if (card.rowCount === 0) {
        throw new ApiError(404, "Банковская карта не найдена");
      }

      // Проверяем PIN
      const isPinValid = await bcrypt.compare(pin, card.rows[0].pin);

      if (!isPinValid) {
        throw new ApiError(403, "Неверный PIN-код");
      }

      // Удаляем карту
      const result = await client.query(
        `DELETE FROM bank_cards
         WHERE id = $1
         RETURNING id`,
        [card_id],
      );

      return result.rows[0];
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Ошибка удаления карты:", error);
    throw new ApiError(500, "Ошибка удаления банковской карты");
  }
};

// Деактивация карты
export const deactivCard = async (
  userId: number,
  pin: string,
  card_id: number,
) => {
  try {
    return await withTransaction(async (client) => {
      // Проверяем пользователя
      await checkUserExists(client, userId);

      // Проверяем карту и её принадлежность пользователю
      const card = await client.query(
        `SELECT bc.id, bc.pin, bc.is_active
         FROM bank_accounts ba
         JOIN bank_cards bc ON bc.bank_account_id = ba.id
         WHERE ba.user_id = $1 AND bc.id = $2
         FOR UPDATE OF bc`,
        [userId, card_id],
      );

      if (card.rowCount === 0) {
        throw new ApiError(404, "Банковская карта не найдена");
      }

      // Проверяем PIN
      const isPinValid = await bcrypt.compare(pin, card.rows[0].pin);

      if (!isPinValid) {
        throw new ApiError(403, "Неверный PIN-код");
      }

      // Проверяем статус карты
      if (!card.rows[0].is_active) {
        throw new ApiError(400, "Банковская карта уже деактивирована");
      }

      // Деактивируем карту
      const result = await client.query(
        `UPDATE bank_cards
         SET is_active = false
         WHERE id = $1
         RETURNING id, card_number, card_name, is_active`,
        [card_id],
      );

      return result.rows[0];
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Ошибка деактивации карты:", error);
    throw new ApiError(500, "Ошибка деактивации банковской карты");
  }
};

// Активация карты
export const activCard = async (
  userId: number,
  pin: string,
  card_id: number,
) => {
  return withTransaction(async (client) => {
    // Проверяем существование пользователя
    await checkUserExists(client, userId);

    // Получаем карту и проверяем принадлежность пользователю
    const card = await client.query(
      `SELECT bc.id, bc.pin, bc.is_active
       FROM bank_cards bc
       JOIN bank_accounts ba ON ba.id = bc.bank_account_id
       WHERE bc.id = $1 AND ba.user_id = $2
       FOR UPDATE OF bc`,
      [card_id, userId],
    );

    if (card.rowCount === 0) {
      throw new ApiError(404, "Карта не найдена");
    }

    // Проверяем PIN
    const isPinValid = await bcrypt.compare(pin, card.rows[0].pin);

    if (!isPinValid) {
      throw new ApiError(401, "Неверный PIN-код");
    }

    // Проверяем, не активирована ли уже карта
    if (card.rows[0].is_active) {
      throw new ApiError(400, "Карта уже активирована");
    }

    // Активируем карту
    const result = await client.query(
      `UPDATE bank_cards
       SET is_active = true
       WHERE id = $1
       RETURNING id, card_number, card_name, is_active`,
      [card_id],
    );

    return result.rows[0];
  });
};
