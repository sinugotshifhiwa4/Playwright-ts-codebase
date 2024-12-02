import EnvironmentManager from "../helpers/environmentManager";
import errorHandler from "../helpers/errorHandler";
import logger from "../utils/loggerUtil";

export default class EncryptionManager {
    
  // initialise new instance of Environment Manager
  private static envManager = new EnvironmentManager();

  /**
   * Generates a cryptographically secure random secret key and stores it in the .env file
   * under the given key name.
   *
   * @param keyName - The name of the key to store in the environment file.
   * @returns The generated secret key as a base64 string or undefined if an error occurs.
   * @throws {Error} If an error occurs during key generation or storage.
   */
  public static generateAndStoreKey(keyName: string): string | undefined {
    try {
      // Generate the secret key
      const secretKey = this.envManager.generateSecretKey();

      if (secretKey === undefined) {
        logger.error("Failed to generate secret key");
        throw new Error("Failed to generate secret key");
      }

      // Store the generated secret key in the .env file
      this.envManager.storeKeyInEnv(keyName, secretKey);

      return secretKey;
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        `generateAndStoreKey`,
        `Failed to generate and store secret key`
      );
      throw error;
    }
  }

  /**
   * Encrypts environment variables for the given environment using the AES-256-CBC encryption
   * algorithm with the given secret key.
   *
   * @param env - The name of the environment to encrypt.
   * @param secretKey - The secret key used to derive the encryption key.
   * @throws {Error} If an error occurs during encryption.
   */
  public static encryptEnvironmentVariables(env: string, secretKey: string) {
    try {
      // initialize encryption
      this.envManager.initializeEncryption(env, secretKey);

      // encrypt environment variables
      this.envManager.encryptEnvVariables();
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "encryptEnvironmentVariables",
        "Failed to encrypt environment variables"
      );
      throw error;
    }
  }
}
