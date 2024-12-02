import logger from "../../utils/loggerUtil";
import ENV from "../../utils/envVariables";
import errorHandler from "../../helpers/errorHandler";

export default class BaseRoutes {
  public readonly baseUrl: string;

  constructor() {
    // Initialize the base URL
    this.baseUrl = this.initializeBaseUrl();
  }

  /**
   * Initializes the base URL to be used for constructing API endpoints.
   * Checks if the API_URL environment variable is set and logs an error if it is not.
   * Logs the base URL and returns it.
   * @returns The base URL string
   * @throws If the API_URL environment variable is not set
   */
  private initializeBaseUrl(): string {
    try {
      const url = ENV.API_URL;

      if (!url) {
        const errorMessage = `API Base URL is not set in the environment variable.`;
        errorHandler.logAndThrowError(errorMessage);
      }

      logger.info(`Base URL: ${url}`);
      return url;
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "initializeBaseUrl",
        "Failed to initialize API base URL"
      );
      throw error;
    }
  }

  /**
   * Generates a URL by appending the given endpoint to the base URL.
   * Logs the generated URL and returns it.
   * @param endpoint - The endpoint to be appended to the base URL.
   * @param type - The type of URL being generated, used for logging.
   * @returns The generated URL string
   * @throws If the endpoint is empty or if there is an issue generating the URL
   */
  public generateUrl(endpoint: string, type: string): string {
    // Validate parameters
    if (!endpoint) {
      logger.error("Endpoint must not be empty.");
      throw new Error("Endpoint must not be empty.");
    }
    if (!type) {
      logger.error("Type must not be empty.");
      throw new Error("Type must not be empty.");
    }

    try {
      const fullUrl = new URL(endpoint, this.baseUrl).toString();
      logger.info(`${type} URL generated: ${fullUrl}`);
      return fullUrl;
    } catch (error) {
      const errorMessage = `Failed to generate ${type} URL from endpoint: ${endpoint}`;
      errorHandler.logGeneralError(error, "generateUrl", errorMessage);
      throw new Error(errorMessage); // Throwing a more specific error
    }
  }
}
