import crypto from "node:crypto";

export const generateCardNumberOnCreateCard = () => {
  return Array.from({ length: 16 }, () => crypto.randomInt(0, 10)).join("");
};
