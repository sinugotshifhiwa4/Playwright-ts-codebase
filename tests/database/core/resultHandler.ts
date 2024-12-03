import sql from "mssql";
import logger from "../../utils/loggerUtil";
import errorHandler from "../../helpers/errorHandler";

export default class ResultHandler {

  /**
   * Validates that the given response is not null or undefined.
   * If the response is null or undefined, logs an error message using the provided
   * custom logger or a default logger, and throws an error with the specified message.
   *
   * @template T - The type of the response.
   * @param {T | null | undefined} response - The response to validate.
   * @param {string} errorMessage - The error message to log and throw if the response is invalid.
   * @param {typeof logger} [customLogger] - An optional custom logger to use for logging the error.
   *                                         If not provided, the default logger is used.
   * @throws Will throw an error if the response is null or undefined.
   */
  public validateResponse<T>(
    response: T | null | undefined,
    errorMessage: string,
    customLogger?: typeof logger
  ): void {
    try {
      if (!response) {
        const log = customLogger || logger;
        log.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      errorHandler.logGeneralError(error, "validateResponse");
      throw error;
    }
  }

  /**
   * Handles the results of a query by validating and processing them.
   * @param result The result of the query to handle.
   * @returns An array of records or null if the query returned no records or an invalid result.
   */
  public handleQueryResults(
    result: sql.IResult<unknown>
  ): Record<string, unknown>[] | null {
    try {
      const recordCount = result.recordset.length;

      if (recordCount === 1) {
        // Handle single record and return it
        const singleRecord = this.handleSingleResult(result.recordset[0]);
        return singleRecord ? [singleRecord] : null; // Return as an array or null if invalid
      } else if (recordCount > 1) {
        // Handle multiple records and return them
        return this.handleMultipleResults(result.recordset);
      } else {
        logger.warn("Query returned an unexpected number of results.");
        return null; // Return null for no records
      }
    } catch (error) {
      errorHandler.logDatabaseError(error, "handleQueryResults");
      throw error;
    }
  }

  /**
   * Handles a single record result by validating and returning it.
   * @param record The single record result to handle.
   * @returns The single record or null if the record is empty or invalid.
   */
  public handleSingleResult(record: unknown): Record<string, unknown> | null {
    try {
      if (this.isRecord(record)) {
        logger.info(`Query result (single record): ${JSON.stringify(record)}`);
        return record as Record<string, unknown>; // Cast to Record type
      } else {
        logger.warn("Query returned an empty or invalid result.");
        return null; // Return null for invalid records
      }
    } catch (error) {
      errorHandler.logDatabaseError(error, "handleSingleResult");
      throw error;
    }
  }

  /**
   * Handles multiple records result by validating and returning them.
   * @param records The multiple records result to handle.
   * @returns An array of valid records or an empty array if all records are invalid.
   */
  public handleMultipleResults(records: unknown[]): Record<string, unknown>[] {
    try {
      logger.info(
        "Query result (multiple records):",
        JSON.stringify(records, null, 2)
      );

      // Filter and store valid records
      const validRecords: Record<string, unknown>[] = [];

      records.forEach((record) => {
        if (this.isRecord(record)) {
          logger.info(`Valid Record: ${JSON.stringify(record)}`);
          validRecords.push(record as Record<string, unknown>); // Cast and store valid records
        } else {
          logger.warn(
            "Record is invalid or does not conform to expected structure."
          );
        }
      });

      return validRecords; // Return the array of valid records
    } catch (error) {
      errorHandler.logDatabaseError(error, "handleMultipleResults");
      throw error;
    }
  }

  /**
   * Checks if a given record is a valid Record<string, unknown> object.
   * @param record The record to check.
   * @returns True if the record is a valid Record object, false otherwise.
   * @private
   */
  private isRecord(record: unknown): record is Record<string, unknown> {
    try {
      return typeof record === "object" && record !== null;
    } catch (error) {
      errorHandler.logDatabaseError(error, "isRecord");
      throw error;
    }
  }
}
