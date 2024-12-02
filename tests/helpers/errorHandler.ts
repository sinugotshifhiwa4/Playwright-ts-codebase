import logger from "../utils/loggerUtil";
import axios, { AxiosResponse } from "axios";
import DatabaseErrorTypes from "./databaseErrorTypes";

export default class ErrorHandler {
  /**
   * Logs a general error with context, method name, and an optional custom message.
   *
   * @param error - The error object, message, or any unknown value to log.
   * @param methodName - The name of the method where the error occurred.
   * @param customMessage - An optional message to provide additional context.
   */
  public static logGeneralError(
    error: unknown,
    methodName: string,
    customMessage?: string
  ): void {
    const messagePrefix = customMessage ? `${customMessage}: ` : "";
    const errorMessage = this.formatErrorMessage(error, messagePrefix);

    logger.error(`[Method: ${methodName}] ${errorMessage}`);
  }

  /**
   * Formats the error message based on the type of error provided.
   *
   * @param error - The error object or value to format.
   * @param messagePrefix - A prefix to prepend to the error message for context.
   * @returns A formatted error message as a string.
   */
  private static formatErrorMessage(
    error: unknown,
    messagePrefix: string
  ): string {
    if (error === null) {
      return `${messagePrefix}Received a null error.`;
    }

    if (error instanceof Error) {
      return `${messagePrefix}Error: ${error.message}`;
    }

    if (typeof error === "object") {
      return `${messagePrefix}Object error: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error)
      )}`;
    }

    return `${messagePrefix}Unknown error type encountered: ${String(error)}`;
  }

  /**
   * Logs an error message and throws the error.
   *
   * @param errorMessage - The error message to log and throw.
   * @returns Never, as this function will always throw an error.
   */
  public static logAndThrowError(errorMessage: string): never {
    logger.error(errorMessage); // Log the error message
    throw new Error(errorMessage); // Throw the error
  }

  /**
   * Handles API responses by logging the request URL and appropriate status code messages.
   * This function is a catch-all for handling responses from API requests. It logs the request URL
   * and handles different status code ranges differently. If the status code is 2xx, it logs a
   * success message. If the status code is 3xx, it logs a redirect message. If the status code is 4xx,
   * it logs an error message. If the status code is 5xx, it logs a server error message. If the status
   * code is unknown, it logs an unexpected status code message.
   *
   * @param methodName - The name of the method that invoked this function. This is used to provide
   *                     context for logging.
   * @param error - The error object or value to handle. If this is an Axios error, the request URL and
   *                status code are extracted from the error object. Otherwise, the error is logged as
   *                an unknown error type.
   */
  public static handleApiResponse(methodName: string, error?: unknown): void {
    try {
      const responseStatusCode =
        error && axios.isAxiosError(error) ? error.response?.status : undefined;
      const statusCode = responseStatusCode ?? 0;
      const requestUrl =
        error && axios.isAxiosError(error) ? error.config?.url : "Unknown URL";

      if (!requestUrl) {
        throw new Error("Unknown URL");
      }

      // Log the URL once at the start
      logger.info(`Request URL: ${requestUrl}\n`);

      // Only log for successful status codes
      if (statusCode >= 200 && statusCode < 300) {
        logger.info(
          `Response with Status Code: ${statusCode} in method: [${methodName}]\n`
        );
        this.handle2xxSuccess(statusCode, methodName);
      } else if (statusCode >= 300 && statusCode < 400) {
        this.handle3xxRedirect(statusCode, methodName, error);
      } else if (statusCode >= 400 && statusCode < 500) {
        this.handle4xxError(statusCode, methodName, error);
      } else if (statusCode >= 500 && statusCode < 600) {
        this.handle5xxError(statusCode, methodName, error);
      } else {
        this.handleAxiosError(
          `An unexpected error occurred while processing your request in method: [${methodName}].\n 
          Please review your request payload, headers, and endpoint configuration.`,
          error
        );
      }
    } catch (error) {
      this.logGeneralError(error, methodName); // no need to throw error here as this class will be called in specific methods and error will be throw there to avoid duplicates
    }
  }

  /**
   * Logs a success message with the given status code and message.
   * @param statusCode - The HTTP status code indicating the success.
   * @param message - The message to log with the success.
   */
  private static handle2xxSuccess(statusCode: number, message: string): void {
    logger.info(`Success: ${statusCode} - ${message}\n`);
  }

  /**
   * Handles 4xx HTTP client error responses by logging a warning and error message.
   * If the error is provided and contains a message, it logs the status code, method name,
   * and error details. If no error details are available, it logs that no details were provided.
   * Delegates to handleAxiosError for further error handling.
   *
   * @param statusCode - The HTTP status code indicating the client error.
   * @param methodName - The name of the method where the error occurred.
   * @param error - Optional error object that may contain additional details.
   */
  private static handle3xxRedirect(
    statusCode: number,
    requestUrl: string,
    error?: unknown
  ): void {
    logger.warn(`[Redirect ${statusCode}] - ${requestUrl}\n`);
    if (error) {
      this.handleAxiosError(
        `Redirection issue: ${statusCode} - ${requestUrl}`,
        error
      );
    }
  }

  /**
   * Handles 4xx HTTP client error responses by logging a warning and error message.
   * If the error is provided and contains a message, it logs the status code, method name,
   * and error details. If no error details are available, it logs that no details were provided.
   * Delegates to handleAxiosError for further error handling.
   *
   * @param statusCode - The HTTP status code indicating the client error.
   * @param methodName - The name of the method where the error occurred.
   * @param error - Optional error object that may contain additional details.
   */
  private static handle4xxError(
    statusCode: number,
    methodName: string,
    error?: unknown
  ): void {
    logger.warn(`[Client Error with Status Code ${statusCode}]\n`);

    if (error) {
      // Extract the message from the error if it's an object
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "No message provided"
          : String(error);

      logger.error(
        `[Client Error] Error occurred in method: ${methodName}, Status: ${statusCode}, Details: ${errorMessage}\n`
      );
      this.handleAxiosError(`[Client error]`, error);
    } else {
      logger.error(
        `[Client Error] Error occurred in method: ${methodName}, but no details provided.\n`
      );
    }
  }

  /**
   * Handles 5xx HTTP server error responses by logging an error message.
   * If the error is provided and contains a message, it logs the status code, method name,
   * and error details. If no error details are available, it logs that no details were provided.
   * Delegates to handleAxiosError for further error handling.
   *
   * @param statusCode - The HTTP status code indicating the server error.
   * @param methodName - The name of the method where the error occurred.
   * @param error - Optional error object that may contain additional details.
   */
  private static handle5xxError(
    statusCode: number,
    methodName: string,
    error?: unknown
  ): void {
    logger.error(`[Server Error ${statusCode}] - Method: ${methodName}\n`);

    if (error) {
      // Extract the message from the error if it's an object
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "No message provided"
          : String(error);

      logger.error(
        `[Server Error] Error occurred in method: ${methodName}, Status: ${statusCode}, Details: ${errorMessage}\n`
      );
      this.handleAxiosError(`[Server error]`, error);
    } else {
      logger.error(
        `[Server Error] Error occurred in method: ${methodName}, but no details provided.\n`
      );
    }
  }

  /**
   * Handles Axios errors by logging the error with additional context.
   * If the error is an Axios error, it logs the status code and the provided message.
   * If the error is not an Axios error, it logs the error as a JSON string with the provided message.
   * @param message - The message to log alongside the error.
   * @param error - The error to log.
   */
  private static handleAxiosError(message: string, error: unknown): void {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;
      logger.error(`Status: ${status} - ${message}\n`);
    } else {
      logger.error(`${message}: ${JSON.stringify(error)}\n`);
    }
  }

  // Agent error handling in Personal details page

  /**
   * Handles agent-related errors in the personal details page by logging the error and throwing an
   * exception. If an error message text is provided, it logs a validation error with the message.
   * Otherwise, it logs a generic error message with the context. If an error occurs during the
   * logging and error throwing process, it logs the error with the context and re-throws the error.
   *
   * @param context - The context of the error, used to provide additional information in the log.
   * @param errorMessageText - An optional error message text to log as a validation error.
   */
  public static handleAgentError(
    context: string,
    errorMessageText?: string
  ): void {
    try {
      const message = errorMessageText
        ? `Validation error: ${errorMessageText}`
        : `Error message ${context}`;
      logger.error(message);
      throw new Error(message);
    } catch (error) {
      this.logGeneralError(error, context);
      throw error;
    }
  }

  public static handleResponseError(response: AxiosResponse): void {
    try {
      // Check if response data exists
      if (!response?.data) {
        logger.error("No response data available.");
        throw new Error("No response data available.");
      }

      const {
        code = "N/A",
        type = "N/A",
        message: errorMessage = "Unknown error",
      } = response.data;
      const status = response.status;

      // If status code is between 400 and 599, throw an error
      if (status >= 400 && status < 600) {
        // Log the error response details
        logger.error(
          `Error Details - Status Code: ${code}, Type: ${type}, Message: ${errorMessage}`
        );
        throw new Error(
          `Error Details - Status Code: ${code}, Type: ${type}, Message: ${errorMessage}`
        );
      }
    } catch (error) {
      this.logGeneralError(error, "handleResponseError");
      throw error;
    }
  }

   /**
   * Logs an error message and throws an error if the cipherText is undefined or empty.
   *
   * @returns Never, as this function will always throw an error.
   */
   public static handleUndefinedCipherText(): never {
    return this.logAndThrowError("cipherText is undefined or empty.");
  }

/**
 * Logs an error message and throws an error indicating that the cipher text format is invalid.
 *
 * The expected format for the cipher text is "salt:iv:encrypted".
 *
 * @returns Never, as this function will always throw an error.
 */
  public static handleInvalidCipherFormat(): never {
    return this.logAndThrowError(
      "Invalid cipherText format. Expected format: salt:iv:encrypted."
    );
  }

  /**
   * Logs an error message indicating that decryption failed and throws an error.
   *
   * The error message will indicate that the decryption failed due to an invalid
   * key or ciphertext.
   *
   * @returns Never, as this function will always throw an error.
   */
  public static handleDecryptionFailure(): never {
    return this.logAndThrowError(
      "Decryption failed. Invalid key or ciphertext."
    );
  }

/**
 * Constructs an error message for a line with invalid format or no variables.
 *
 * @param index - The zero-based index of the line in the file.
 * @param line - The content of the line that has an invalid format.
 * @returns A formatted error message indicating the line number and the issue.
 */
  public static handleInvalidFormatError(index: number, line: string): string {
    return `Line ${
      index + 1
    } doesn't contain any variables or has invalid format: ${line}`;
  }

  // Database error handling

  /**
   * Logs database-related errors with context, method name, and an optional custom message.
   * This function handles errors of type `DatabaseErrorTypes`, standard JavaScript `Error`,
   * and other unknown error types.
   *
   * @param error - The error object or value to log. Can be an instance of `DatabaseErrorTypes`,
   *                a standard JavaScript `Error`, or any unknown value.
   * @param methodName - The name of the method where the error occurred. Used to provide context
   *                     in the log message.
   * @param customMessage - An optional message to provide additional context in the log message.
   */
  public static logDatabaseError(
    error: unknown,
    methodName: string,
    customMessage?: string
  ) {
    try {
      // Prefix for custom messages
      const messagePrefix = customMessage ? `${customMessage}: ` : "";
      // Base message structure for logging
      const baseMessage = `[Database Error in ${methodName}] ${messagePrefix}`;

      // Log the error based on its type
      if (error instanceof DatabaseErrorTypes) {
        logger.error(
          `${baseMessage}Error Type: ${error.type}, Message: ${
            error.message
          }, Details: ${JSON.stringify(error.details || {})}`
        );
      } else if (error instanceof Error) {
        logger.error(
          `${baseMessage}Unexpected database error occurred: ${error.message}`
        );
      } else {
        logger.error(
          `${baseMessage}Non-standard error encountered: ${JSON.stringify(
            error
          )}`
        );
      }
    } catch (error) {
      this.logGeneralError(error, "logDatabaseError");
      throw error;
    }
  }
}
