import MapDataUtil from "../utils/mapDataUtil";
import errorHandler from "./errorHandler";
import logger from "../utils/loggerUtil";

export default class MapDataManager extends MapDataUtil {
  /**
   * Sets a value in the data map for a given testId.
   *
   * This is a wrapper around MapDataUtil.setData that logs any errors that occur.
   *
   * @param map - The map containing data objects associated with test identifiers.
   * @param testId - The identifier of the test to store the data for.
   * @param key - The key to store the value at.
   * @param value - The value to store.
   */
  public static setValueInMap<T>(
    map: Map<string, Record<keyof T, string | number>>,
    testId: string,
    key: keyof T,
    value: string | number
  ) {
    try {
      this.setData(map, testId, key, value);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "setValueInMap",
        `Failed to set value for testId: ${testId}, key: ${String(
          key
        )} in the map`
      );
      throw error;
    }
  }

  /**
   * Retrieves a value from the data map for a given testId.
   *
   * This is a wrapper around MapDataUtil.getData that logs any errors that occur.
   *
   * @param map - The map containing data objects associated with test identifiers.
   * @param testId - The identifier of the test to retrieve the data for.
   * @param key - The key to retrieve the value for.
   * @returns The value associated with the specified key for the given testId, or null if the key does not exist.
   */
  public static getValueFromMap<T>(
    map: Map<string, Record<keyof T, string | number>>,
    testId: string,
    key: keyof T
  ) {
    try {
      return this.getData(map, testId, key);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "getValueFromMap",
        `Failed to retrieve value for testId: ${testId}, key: ${String(
          key
        )} from the map`
      );
      throw error;
    }
  }

  /**
   * Removes a testId from the data map.
   *
   * This is a wrapper around Map.prototype.delete that logs any errors that occur.
   *
   * @param map - The map containing data objects associated with test identifiers.
   * @param testId - The identifier of the test to remove from the map.
   */
  public static removeTestIdFromMap<T>(map: Map<string, T>, testId: string) {
    try {
      map.delete(testId);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "removeTestIdFromMap",
        `Failed to remove testId: ${testId} from the map`
      );
      throw error;
    }
  }

  /**
   * Checks if a testId exists in the data map.
   *
   * This is a wrapper around Map.prototype.has that logs any errors that occur.
   *
   * @param map - The map containing data objects associated with test identifiers.
   * @param testId - The identifier of the test to check for.
   * @returns true if the testId exists in the map; false otherwise.
   */
  public static isTestIdInMap<T>(map: Map<string, T>, testId: string): boolean {
    try {
      return map.has(testId);
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "isTestIdInMap",
        `Failed to check if testId: ${testId} exists in the map`
      );
      throw error;
    }
  }

  /**
   * Retrieves the value associated with a given key from the data map for a specified testId.
   *
   * If the testId does not exist in the map, or if the data associated with the testId is null,
   * undefined, or not an object, an error is logged and thrown.
   *
   * @param map - The map containing data objects associated with test identifiers.
   * @param testId - The identifier of the test whose data is to be retrieved.
   * @param key - The key within the data object for which the value is to be retrieved.
   * @returns The value associated with the specified key for the given testId, or null if the key does not exist.
   * @throws {Error} If the data for the testId is null, undefined, or not an object.
   */
  public static getFieldFromTestDataMap<T>(
    map: Map<string, T>,
    testId: string,
    key: keyof T
  ): string | number | null {
    try {
      if (!map.has(testId)) {
        return null; // Check if the key exists in the map
      }
      const data = map.get(testId); // Retrieve the data for the given testId
      if (data === null || data === undefined || typeof data !== "object") {
        logger.info(
          `Data is null or undefined or not an object for testId: ${testId}`
        );
        throw new Error(
          `Data is null or undefined or not an object for testId: ${testId}`
        );
      }
      return key in data ? (data[key] as string | number | null) : null; // Return the value if the key exists in the data
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "getFieldFromMap",
        `Failed to retrieve the value for testId: ${testId}, key: ${String(
          key
        )} from the map`
      );
      throw error;
    }
  }
}
