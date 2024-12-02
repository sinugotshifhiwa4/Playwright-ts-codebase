import dotenv from "dotenv";
import * as envFiles from "../models/envFilePath";
import errorHandler from "../helpers/errorHandler";
import path from "path";
import fs from "fs";
import logger from "./loggerUtil";

export default class EnvConfig {
  /**
   * Initializes the environment configuration.
   * This function ensures that the environment directory exists, validates the base environment file
   * if it exists, loads the base environment variables, and determines the current environment.
   * If the base environment file does not exist, a warning message is logged.
   * If an error occurs during the setup process, an error is logged and thrown.
   */
  public static initEnvConfiguration() {
    try {
      // ensure the environment directory exists
      EnvConfig.ensureEnvDirExists();

      // base env file path
      const baseEnvFilePath = path.resolve(
        envFiles.Environments.ENV_DIR,
        envFiles.Environments.BASE_ENV_FILE
      );

      // validate base env file if it exists
      const baseEnvExists = EnvConfig.doesEnvFileExist(baseEnvFilePath);

      // if the base environment file exists, and if not, log warn message
      EnvConfig.handleEnvFileLoading(baseEnvFilePath, baseEnvExists);

      // load base environment variables
      const env = EnvConfig.loadEnv();

      // determine the current environment
      EnvConfig.loadEnvFile(
        envFiles.ENV_FILES[env as keyof typeof envFiles.ENV_FILES]
      );
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "initEnvConfiguration",
        "Failed to set up environment variables"
      );
      throw error;
    }
  }

  /**
   * Loads the environment from the ENV variable.
   * If an error occurs, it logs the error and throws an exception.
   *
   * @returns {string} The environment (e.g. "dev", "uat", "prod")
   */
  private static loadEnv(): string {
    try {
      const env = process.env.ENV;
      if (!env || !Object.keys(envFiles.ENV_FILES).includes(env)) {
        throw new Error(
          `Invalid environment specified: ${env}. Expected one of: ${Object.keys(
            envFiles.ENV_FILES
          ).join(", ")}`
        );
      }
      logger.info(
        `Successfully loaded variables for the '${env}' environment.`
      );
      return env;
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "loadEnv",
        "Failed to load environment"
      );
      throw error;
    }
  }

  /**
   * Loads environment variables from the specified file using the dotenv library.
   * If the file does not exist, it logs a warning message with the file path.
   * If an error occurs, it logs the error and throws an exception.
   *
   * @param fileName - The name of the file from which to load environment variables.
   */
  private static loadEnvFile(fileName: string): void {
    try {
      const filePath = EnvConfig.getEnvFilePath(fileName);
      if (fs.existsSync(filePath)) {
        EnvConfig.loadEnvironmentVariables(filePath);
      } else {
        logger.warn(
          `The environment-specific file was not found: ${filePath}. \nEnsure the file exists if decryption is required at runtime, or disregard this warning if the file is unnecessary.`
        );
      }
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "loadEnvFile",
        "Failed to load environment file"
      );
      throw error;
    }
  }

  /**
   * Ensures that the environment directory and base environment file exist.
   * If the environment directory does not exist, it creates one. If the base
   * environment file does not exist, it creates an empty file. If an error
   * occurs, it logs the error and throws an exception.
   */
  public static ensureEnvDirExists() {
    try {
      // Check if the environment directory exists; create it if not
      if (!fs.existsSync(envFiles.Environments.ENV_DIR)) {
        fs.mkdirSync(envFiles.Environments.ENV_DIR);
        logger.info(
          `Created environment directory: ${envFiles.Environments.ENV_DIR}`
        );
      }
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "ensureEnvDirExists",
        "Failed to ensure environment file exists"
      );
      throw error;
    }
  }

  public static ensureEnvFileExists() {
    try {
      // Check if the base environment file exists; create it if not
      const baseEnvFilePath = path.join(
        envFiles.Environments.ENV_DIR,
        envFiles.Environments.BASE_ENV_FILE
      );
      if (!fs.existsSync(baseEnvFilePath)) {
        fs.writeFileSync(baseEnvFilePath, "", { flag: "wx" }); // Create an empty file if it doesn't exist
        logger.info(`Created base environment file: ${baseEnvFilePath}`);
      }
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "ensureEnvDirExists",
        "Failed to ensure environment file exists"
      );
      throw error;
    }
  }

  private static doesEnvFileExist(filePath: string): boolean {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "doesEnvFileExist",
        "Failed to check if environment file exists"
      );
      throw error;
    }
  }

  /**
   * Handles loading of the base environment file (.env) if it exists.
   * If the file exists, it loads the environment variables from the file.
   * Otherwise, it logs a warning message.
   * If an error occurs during file loading, it logs the error and throws an exception.
   *
   * @param baseEnvFilePath - The path to the base environment file.
   * @param baseEnvExists - A boolean indicating whether the base environment file exists.
   */
  private static handleEnvFileLoading(
    baseEnvFilePath: string,
    baseEnvExists: boolean
  ) {
    try {
      // If .env exists, load it; otherwise, print a warning message
      if (baseEnvExists) {
        this.loadEnvFile(baseEnvFilePath);
        logger.info(`Base environment file '.env' loaded successfully.`);
      } else {
        logger.warn(`Base environment file not found. Skipping file load.`);
      }
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "globalSetup",
        "Failed to set up environment variables"
      );
      throw error;
    }
  }

  /**
   * Loads environment variables from the specified file path using the dotenv library.
   * Overrides existing environment variables if they are already set.
   * Logs an error and throws an exception if loading fails.
   *
   * @param filePath - The path to the environment file from which variables are to be loaded.
   */
  private static loadEnvironmentVariables(filePath: string): void {
    try {
      const result = dotenv.config({ path: filePath, override: true });

      if (result.error) {
        logger.error(
          `Error loading environment variables from ${filePath}: ${result.error.message}`
        );
        throw new Error(
          `Error loading environment variables from ${filePath}: ${result.error.message}`
        );
      }
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "loadEnvironmentVariablesFromFile",
        `Failed to load variables from ${filePath}`
      );
      throw error;
    }
  }

  /**
   * Returns the path to the environment file with the given file name.
   * This function will log an error if an exception occurs and throw the error.
   *
   * @param fileName - The name of the file to get the path for (e.g., ".env", ".env.dev", etc.)
   * @returns The path to the environment file.
   */
  private static getEnvFilePath(fileName: string): string {
    try {
      return path.resolve(envFiles.Environments.ENV_DIR, fileName);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "getEnvFilePath",
        "Failed to get environment file path"
      );
      throw error;
    }
  }
}
