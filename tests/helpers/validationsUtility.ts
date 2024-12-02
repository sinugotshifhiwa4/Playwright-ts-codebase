import { AxiosResponse } from "axios";
import errorHandler from "./errorHandler";
import logger from "../utils/loggerUtil";

class ValidationsUtility {
  /**
   * Validates the response status code matches the expected status code.
   *
   * Logs a success message if the status codes match and throws a ValidationError if they do not.
   * The error message includes the received and expected status codes, method name, and a suggestion
   * to review the request payload, headers, and endpoint configuration.
   *
   * @param responseStatusCode - The received response status code.
   * @param expectedStatusCode - The expected response status code.
   * @param methodName - The name of the method where the error occurred.
   * @returns True if the status codes match, otherwise throws a ValidationError.
   */
  private validateResponseStatusCode(
    responseStatusCode: number,
    expectedStatusCode: number,
    methodName: string
  ): boolean {
    if (responseStatusCode === expectedStatusCode) {
      this.logInfo(
        `Validation successful: Received status code ${responseStatusCode} matches the expected status code ${expectedStatusCode}.`
      );
      return true;
    } else {
      const errorMessage = `
      Response status code mismatch:
      - Received: ${responseStatusCode}
      - Expected: ${expectedStatusCode}
      An unexpected error occurred while processing your request in method [${methodName}]. Please review your request payload, headers, and endpoint configuration.`;

      this.logError(errorMessage);
      throw new ValidationError(errorMessage);
    }
  }

  /**
   * Asserts that the provided response is not null and logs a success message if true.
   * If the response is null, logs an error message and throws a ValidationError.
   * @param response - The response object or null.
   * @param method - The name of the method where the error occurred.
   * @returns The response object if not null.
   */
  private assertResponseNotNull(
    response: AxiosResponse | null,
    method: string
  ): AxiosResponse {
    if (!response) {
      const errorMessage = `Received null response from [${method}].`;
      errorHandler.logAndThrowError(errorMessage);
    }
    this.logInfo(
      `Received non-null response from ${method} with status code: ${response.status}`
    );
    return response;
  }

  /**
   * Validates the response status code matches the expected status code, and logs a success or error
   * message accordingly. If handleErrors is true, it logs and throws errors in the response.
   *
   * @param response - The received response object or null.
   * @param expectedStatusCode - The expected response status code.
   * @param methodName - The name of the method where the error occurred.
   * @param handleErrors - Whether to handle errors in the response.
   * @returns A promise that resolves if the status codes match and handleErrors is false, or if the
   *          error is handled and logged if handleErrors is true. Otherwise, throws a ValidationError.
   */
  private async validateApiResponse(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    methodName: string,
    handleErrors: boolean
  ): Promise<void> {
    try {
      // Ensure the response is not null
      const validResponse = this.assertResponseNotNull(response, methodName);

      // Validate the response status code
      this.validateResponseStatusCode(
        validResponse.status,
        expectedStatusCode,
        methodName
      );

      // Handle errors in the response if applicable
      if (handleErrors) {
        errorHandler.handleResponseError(validResponse);
      }
    } catch (error) {
      errorHandler.logGeneralError(error, "handleApiResponse");
      throw error;
    }
  }

  /**
   * Validates the response status code matches the expected status code, and logs a success or error
   * message accordingly. If the response status code matches the expected status code, logs a success
   * message. Otherwise, logs an error message and throws a ValidationError.
   *
   * @param response - The received response object or null.
   * @param expectedStatusCode - The expected response status code.
   * @param methodName - The name of the method where the error occurred.
   * @returns A promise that resolves if the status codes match, or throws a ValidationError if they do not.
   */
  public validateSuccessfulApiResponse(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    methodName: string
  ): Promise<void> {
    return this.validateApiResponse(
      response,
      expectedStatusCode,
      methodName,
      true
    );
  }

  /**
   * Validates the response status code matches the expected status code, and logs a success or error
   * message accordingly. If the response status code matches the expected status code, logs a success
   * message. Otherwise, logs an error message and throws a ValidationError.
   *
   * @param response - The received response object or null.
   * @param expectedStatusCode - The expected response status code.
   * @param methodName - The name of the method where the error occurred.
   * @returns A promise that resolves if the status codes match, or throws a ValidationError if they do not.
   */
  public validateApiResponseWithoutErrorHandling(
    response: AxiosResponse | null,
    expectedStatusCode: number,
    methodName: string
  ): Promise<void> {
    return this.validateApiResponse(
      response,
      expectedStatusCode,
      methodName,
      false
    );
  }

  /**
   * Logs a message as an info level log event.
   *
   * @param message - The message to log.
   */
  private logInfo(message: string): void {
    logger.info(message);
  }

  /**
   * Logs a message as an error level log event.
   *
   * @param message - The message to log.
   */
  private logError(message: string): void {
    logger.error(message);
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export default new ValidationsUtility();
