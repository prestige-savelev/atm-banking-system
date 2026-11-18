// src/utils/async-handler.ts
import type { NextFunction, Request, Response } from "express";

/**
 * Утилита, оборачивающая асинхронный обработчик роута (без `next()`), чтобы любая ошибка автоматически
 * передавалась в `next()`. Это позволяет избежать включения блоков `try/catch` в каждый асинхронный обработчик.
 *
 * @param fn Асинхронный обработчик запросов Express, возвращающий промис.
 * @returns Стандартный обработчик запросов Express.
 */

export function asyncHandler(
  function_: (request: Request, response: Response) => Promise<void>,
): (request: Request, response: Response, next: NextFunction) => Promise<void> {
  return async function (request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      await function_(request, response);
    } catch (error) {
      next(error);
    }
  };
}