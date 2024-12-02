import EnvConfig from "../utils/envConfig";
import errorHandler from "../helpers/errorHandler";

/**
 * Global setup function for Playwright tests.
 * Initializes the environment configuration by ensuring the environment directory exists
 * and loading the base and current environment variables.
 * Logs an error and throws an exception if setup fails.
 * @returns {void} Nothing.
 */
function globalSetup(): void {
  try {
    EnvConfig.initEnvConfiguration();
  } catch (error) {
    errorHandler.logGeneralError(
      error,
      "globalSetup",
      "Failed to set up environment variables"
    );
    throw error;
  }
}

export default globalSetup;
