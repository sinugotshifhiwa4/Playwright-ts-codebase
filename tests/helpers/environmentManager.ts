import CryptoUtil from "../utils/cryptoUtil";
import CryptoManager from "./cryptoManager";
import EnvConfig from "../utils/envConfig";
import * as envFiles from "../models/envFilePath";
import { FileEncoding } from "../models/utilityEnums";
import * as fs from "fs";
import * as path from "path";
import errorHandler from "./errorHandler";
import logger from "../utils/loggerUtil";

export default class EnvironmentManager {

  // .env file path
  private envDirPath: string;
  private readonly baseEnvFilePath: string;
  private envFilePath: string;
  private secretKey: string;

  constructor() {
    // set env dir path
    this.envDirPath = path.resolve(
      process.cwd(),
      envFiles.Environments.ENV_DIR
    );

    // set base env file path
    this.baseEnvFilePath = path.resolve(
      envFiles.Environments.ENV_DIR,
      envFiles.Environments.BASE_ENV_FILE
    );

    // Initialize env file path and secret key to empty strings.
    // These values will be reassigned in the initializeEncryption method.
    this.envFilePath = "";
    this.secretKey = "";

    // ensure env dir and base env file exist
    EnvConfig.ensureEnvDirExists();
    EnvConfig.ensureEnvFileExists();
  }

  // Base env setup

  /**
   * Generates a cryptographically secure random secret key of the default length.
   *
   * @returns The generated secret key as a base64 string or undefined if an error occurs.
   * @throws {Error} If an error occurs during key generation.
   */
  public generateSecretKey(): string | undefined {
    try {
      return CryptoUtil.generateKey(); // using default key length
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "generateSecretKey",
        "Failed to generate secret key"
      );
      throw error;
    }
  }

  /**
   * Writes the specified content to the base environment file.
   * The content is written using UTF-8 encoding.
   * Logs an informational message with the provided key name upon success.
   * If an error occurs during writing, it logs the error and throws an exception.
   *
   * @param content - The content to write to the environment file.
   * @param keyName - The name of the key associated with the content being written.
   * @throws {Error} If an error occurs during file writing.
   */
  private writeKeyToEnvFile(content: string, keyName: string): void {
    try {
      fs.writeFileSync(this.baseEnvFilePath, content, FileEncoding.UTF8);
      logger.info(`${keyName} written to .env file`);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "writeEnvFile",
        `Failed to write ${keyName} to .env file`
      );
      throw error;
    }
  }

  /**
   * Reads the content of the base environment file.
   * The file is read using UTF-8 encoding.
   * Logs an error and throws an exception if reading fails.
   *
   * @returns The content of the environment file as a string.
   * @throws {Error} If an error occurs during file reading.
   */
  private readBaseEnvFile(): string {
    try {
      return fs.readFileSync(this.baseEnvFilePath, FileEncoding.UTF8);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "readEnvFile",
        "Failed to read .env file"
      );
      throw error;
    }
  }

  /**
   * Reads the value of a key from the base environment file.
   * The value is extracted using a regular expression.
   * Logs an error and throws an exception if reading fails.
   *
   * @param keyName - The name of the key to read from the environment file.
   * @returns The value of the key as a string. If the key does not exist in the file, returns undefined.
   * @throws {Error} If an error occurs during file reading.
   */
  public getKeyValue(keyName: string): string | undefined {
    try {
      const envConfig = this.readBaseEnvFile();
      const regex = new RegExp(`^${keyName}=(.*)$`, "m");
      const match = envConfig.match(regex);
      return match ? match[1] : undefined;
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "getKeyValue",
        `Failed to read ${keyName} from .env file`
      );
      throw error;
    }
  }

  /**
   * Stores a key-value pair in the base environment file.
   * If the key already exists, its value is updated; otherwise, the key-value pair is appended.
   * Logs an error and throws an exception if the operation fails.
   *
   * @param keyName - The name of the key to store in the environment file.
   * @param keyValue - The value to be associated with the key.
   * @throws {Error} If an error occurs during file reading or writing.
   */
  public storeKeyInEnv(keyName: string, keyValue: string): void {
    try {
      // read the env file
      let envConfig = this.readBaseEnvFile();

      // Update or append the specified key
      const regex = new RegExp(`^${keyName}=.*`, "m");
      if (regex.test(envConfig)) {
        envConfig = envConfig.replace(regex, `${keyName}=${keyValue}`);
      } else {
        envConfig += `${keyName}=${keyValue}\n`;
      }

      this.writeKeyToEnvFile(envConfig, keyName);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "storeKeyInEnv",
        `Failed to store ${keyName} in .env file`
      );
      throw error;
    }
  }

  // Encryption setup

  /**
   * Initializes the encryption process by setting the environment file path and
   * deriving the secret key.
   *
   * @param env - The name of the environment to resolve the path.
   * @param secretKey - The initial secret key used for deriving the encryption key.
   * @throws {Error} If an error occurs while initializing encryption.
   */
  public initializeEncryption(env: string, secretKey: string): void {
    try {
      this.envFilePath = path.resolve(this.envDirPath, env);
      this.secretKey = this.getSecretKey(secretKey);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "initializeEncryption",
        "Failed to initialize encryption"
      );
      throw error;
    }
  }

  /**
   * Encrypts environment variables by reading the environment file, encrypting each line,
   * and writing the encrypted lines back to the file. Logs a success message indicating
   * the number of variables encrypted.
   *
   * @throws {Error} If an error occurs during the encryption process.
   */
  public encryptEnvVariables(): void {
    try {
      // Read the environment file
      const envFileContent = this.readEnvFileAsLines();
      // Encrypt the environment variables, line by line
      const encryptedLines = this.encryptLines(envFileContent);
      // Write the encrypted lines to the environment file
      this.writeEnvFileLines(encryptedLines);
      // Log the encryption success message
      this.logEncryptionSuccess(envFileContent.length, encryptedLines.length);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "encryptEnvParameters",
        "Failed to encrypt environment parameters"
      );
      throw error;
    }
  }

  /**
   * Encrypts an array of strings where each string is expected to be a line from
   * a properties file. The input should be an array of strings, and each string
   * should be in the format "key=value". The function will preserve the order and
   * whitespace of the input, and will return an array of strings where each string
   * is the encrypted equivalent of the input line.
   *
   * If the input contains any lines that are empty or contain only whitespace, the
   * function will throw an error.
   *
   * If the input contains any lines that do not contain a "=", the function will
   * log an error message and skip the line.
   *
   * If the input contains any lines that cannot be encrypted, the function will
   * log an error message and skip the line.
   *
   * @param lines - The array of strings to encrypt.
   * @returns An array of strings where each string is the encrypted equivalent of
   * the input line.
   * @throws {Error} If the input is not an array of strings.
   * @throws {Error} If the input contains any lines that are empty or contain only
   * whitespace.
   * @throws {Error} If the input contains any lines that cannot be encrypted.
   */
  private encryptLines(lines: string[]): string[] {
    try {
      if (
        !Array.isArray(lines) ||
        !lines.every((line) => typeof line === "string")
      ) {
        logger.error("Input must be an array of strings.");
        throw new TypeError("Input must be an array of strings.");
      }

      if (lines.every((line) => line.trim() === "")) {
        errorHandler.logAndThrowError(
          "File is completely empty or contains only whitespace."
        );
      }

      const encryptedLines: string[] = [];
      const errors: string[] = [];

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const trimmedLine = line.trim();

        if (trimmedLine === "") {
          encryptedLines.push(""); // Keep empty lines unchanged
          continue;
        }

        if (!trimmedLine.includes("=")) {
          const errorMessage = errorHandler.handleInvalidFormatError(
            index,
            line
          );
          logger.error(errorMessage);
          errors.push(errorMessage);
          continue; // Skip malformed lines
        }

        const [key, value] = trimmedLine.split("=");
        if (value) {
          // Generate encryption metadata
          const encryptionResult = CryptoManager.encrypt(
            value.trim(),
            this.secretKey
          );
          const encryptedValue = JSON.stringify(encryptionResult); // Serialize to JSON
          encryptedLines.push(`${key}=${encryptedValue}`); // Add serialized JSON
        } else {
          encryptedLines.push(line); // Preserve the line if no value
        }
      }

      if (errors.length > 0) {
        errorHandler.logGeneralError(
          new Error(errors.join("\n")),
          "encryptLines",
          "Failed to encrypt some lines"
        );
      }
      return encryptedLines;
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "encryptLines",
        "Failed to encrypt lines"
      );
      throw error;
    }
  }

  /**
   * Retrieves the secret key for encryption/decryption processes.
   *
   * Validates the presence of the secret key, logging and throwing an error if it is not found.
   *
   * @param secretKey - The secret key to validate and return.
   * @returns The validated secret key.
   * @throws {Error} If the secret key is not found or an error occurs during retrieval.
   */
  private getSecretKey(secretKey: string): string {
    try {
      if (!secretKey) {
        errorHandler.logAndThrowError("Key not found in .env file");
      }
      return secretKey;
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "getSecretKey",
        "Failed to get secret key"
      );
      throw error;
    }
  }

  /**
   * Reads the contents of the environment file as an array of strings.
   * Each string is a line from the file, and the array is returned in the order
   * that the lines appear in the file.
   *
   * If the file does not exist or cannot be read, the function logs an error
   * and throws an exception.
   *
   * @returns An array of strings, each string representing a line from the file.
   * @throws {Error} If the file does not exist or cannot be read.
   */
  private readEnvFileAsLines(): string[] {
    try {
      return fs.readFileSync(this.envFilePath, FileEncoding.UTF8).split("\n");
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "readEnvFile",
        "Failed to read environment file"
      );
      throw error;
    }
  }

  /**
   * Writes an array of strings to the environment file.
   * Each string in the array represents a line to be written.
   *
   * If an error occurs during writing, it logs the error and throws an exception.
   *
   * @param lines - The array of strings to write to the environment file.
   * @throws {Error} If an error occurs during file writing.
   */
  private writeEnvFileLines(lines: string[]): void {
    try {
      fs.writeFileSync(this.envFilePath, lines.join("\n"), FileEncoding.UTF8);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "writeEnvFile",
        "Failed to write encrypted lines to environment file"
      );
      throw error;
    }
  }

  /**
   * Logs a success message with the number of encrypted variables to the console.
   * This method is called after the encryption process is complete.
   *
   * @param originalCount - The total number of variables in the environment file.
   * @param encryptedCount - The number of variables that were successfully encrypted.
   */
  private logEncryptionSuccess(
    originalCount: number,
    encryptedCount: number
  ): void {
    try {
      const relativePath = path.relative(process.cwd(), this.envFilePath);
      logger.info(
        `Encryption complete. Successfully encrypted ${encryptedCount} variable(s) in the ${relativePath} file.`
      );
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "logEncryptionSuccess",
        "Failed to log encryption success"
      );
      throw error;
    }
  }
}
