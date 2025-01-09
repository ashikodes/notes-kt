import crypto from "crypto";

// Encryption and decryption key (must be 32 bytes for AES-256)
// Generate a 32-byte encryption key (for AES-256-CBC)
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(`${process.env.ENCRYPTION_KEY}`) // Replace with your own secret
  .digest("base64")
  .slice(0, 32); // Ensure it is exactly 32 bytes
const IV_LENGTH = 16; // AES block size (16 bytes)

export type tokenObjectType = {
  email: string,
  otp: string,
}

/**
 * Encrypts an object.
 * @param {Object} obj - The object to encrypt.
 * @returns {string} - The encrypted string.
 */
export function encryptObject(obj: tokenObjectType): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH); // Initialization vector
    console.log("iv", iv, ENCRYPTION_KEY, crypto.randomBytes(IV_LENGTH), crypto.randomBytes(32));
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(obj)),
      cipher.final(),
    ]);
  
    // Return the IV and encrypted data as a single string
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Error encrypting object:", error);
    return "";
  }
}

/**
 * Decrypts an encrypted string back into an object.
 * @param {string} encryptedData - The encrypted string.
 * @returns {Object} - The decrypted object.
 */
export function decryptToObject(encryptedData: string): tokenObjectType {
  try {
    const [ivHex, encryptedHex] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
  
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
  
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error("Error decrypting object:", error);
    return { email: "", otp: "" };
  }
}
