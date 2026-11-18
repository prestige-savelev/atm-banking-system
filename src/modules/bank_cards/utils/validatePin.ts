export const isValidPin = (pin: unknown): boolean => {
  const pinStr = String(pin ?? "").trim();
  return /^\d{4}$/.test(pinStr);
};
