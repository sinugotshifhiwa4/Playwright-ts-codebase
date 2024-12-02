import CryptoJS from "crypto-js";
import CryptoUtil from "../utils/cryptoUtil";
import errorHandler from "./errorHandler";
import * as interfaces from "../models/interfaces";

export default class CryptoManager extends CryptoUtil{

      /**
   * Encrypts the given value using the AES-256-CBC encryption algorithm
   * with a randomly generated salt and initialization vector.
   *
   * @param value - The value to encrypt.
   * @param secretKey - The secret key used to derive the encryption key.
   * @returns An object containing the encrypted value, salt, initialization
   * vector, and message authentication code.
   * @throws {Error} If an error occurs during encryption.
   */
  public static encrypt(
    value: string,
    secretKey: string
  ): interfaces.EncryptionParams {
    try {
      // Generate a random salt and IV
      const salt = this.generateSalt();
      const iv = this.generateIvAsBase64();

      // Derive a key from the secret key and salt
      const key = this.deriveKey(secretKey, salt);

      // Encrypt the value
      const cipherText = CryptoJS.AES.encrypt(value, key, {
        iv: CryptoJS.enc.Base64.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString();

      // Generate the MAC
      const mac = this.generateMac(salt, iv, cipherText, key);

      return { salt, iv, cipherText, mac };
    } catch (error) {
      errorHandler.logGeneralError(error, "encrypt", "Failed to encrypt text");
      throw error;
    }
  }

  /**
   * Decrypts the given encrypted data using the AES-256-CBC decryption algorithm
   * with a derived key and verifies the message authentication code (MAC).
   *
   * @param encryptedData - The encrypted data to decrypt.
   * @param secretKey - The secret key used to derive the decryption key.
   * @returns The decrypted string value.
   * @throws {Error} If an error occurs during decryption or MAC verification.
   */
  public static decrypt(encryptedData: string, secretKey: string): string {
    if (!encryptedData) {
      errorHandler.logAndThrowError("Encrypted data is required.");
    }

    // Extract the salt, IV, ciphertext, and MAC from the encrypted data
    let parsedData: interfaces.EncryptionParams;

    try {
      // Parse the encrypted data as JSON
      parsedData = JSON.parse(encryptedData) as interfaces.EncryptionParams;

      // Validate if the required properties are present
      this.validateParsedData(parsedData);
    } catch (error) {
      errorHandler.logAndThrowError(
        `Invalid encrypted data format. Unable to parse JSON: ${error}`
      );
    }

    // Pass the salt, IV, ciphertext, and MAC to the decrypt function
    const { salt, iv, cipherText, mac } = parsedData;

    try {
      // Derive a key from the secret key and salt
      const decodedIv = CryptoJS.enc.Base64.parse(iv);
      const decodedCipherText = CryptoJS.enc.Base64.parse(cipherText);
      const key = this.deriveKey(secretKey, salt);

      // Verify the MAC
      const computedMac = this.generateMac(salt, iv, cipherText, key);

      if (computedMac !== mac) {
        errorHandler.logAndThrowError(
          "MAC verification failed. The data may have been tampered with."
        );
      }

      // Decrypt the ciphertext
      const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: decodedCipherText } as CryptoJS.lib.CipherParams,
        key,
        { iv: decodedIv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );

      // Convert the decrypted bytes to a string
      const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        errorHandler.logAndThrowError(
          "Decryption failed. The result is empty or malformed."
        );
      }

      return decrypted;
    } catch (error) {
      errorHandler.logGeneralError(error, "decrypt", "Failed to decrypt text");
      throw error;
    }
  }
}