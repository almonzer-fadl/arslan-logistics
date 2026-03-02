import CryptoJS from "crypto-js";

const SECRET = process.env.ENCRYPTION_SECRET || process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "";

/**
 * Encrypt a string using AES-256
 */
export function encrypt(text: string): string {
  if (!SECRET) throw new Error("Encryption secret not configured");
  return CryptoJS.AES.encrypt(text, SECRET).toString();
}

/**
 * Decrypt an AES-256 encrypted string
 */
export function decrypt(ciphertext: string): string {
  if (!SECRET) throw new Error("Encryption secret not configured");
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypt credentials object
 */
export function encryptCredentials(credentials: {
  username?: string;
  password?: string;
  email?: string;
  apiKey?: string;
  notes?: string;
}): string {
  return encrypt(JSON.stringify(credentials));
}

/**
 * Decrypt credentials object
 */
export function decryptCredentials(encrypted: string): {
  username?: string;
  password?: string;
  email?: string;
  apiKey?: string;
  notes?: string;
} {
  const decrypted = decrypt(encrypted);
  return JSON.parse(decrypted);
}
