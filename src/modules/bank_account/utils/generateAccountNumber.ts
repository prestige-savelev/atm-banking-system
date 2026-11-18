import crypto from "node:crypto";

export const generateAccountNumber = () => {
    return Array.from({ length: 18 }, () => crypto.randomInt(0, 10)).join("");
};