import logger from "./loggerUtil";
import errorHandler from "../helpers/errorHandler";

export default class MapDataUtil {
  /**
   * Sets a value in the data map for a given testId.
   *
   * If the testId is not yet present in the map, it is added with an empty object as value.
   *
   * The value is stored at the given key in the object for the testId.
   *
   * @param map the map to store the data in
   * @param testId the id of the test to store the data for
   * @param key the key to store the value at
   * @param value the value to store
   */
  public static setData<T extends Record<keyof T, string | number>>(
    map: Map<string, T>,
    testId: string,
    key: keyof T,
    value: string | number
  ): void {
    if (!testId || !key) {
      logger.error("Invalid testId or key provided to setData.");
      throw new Error("Invalid testId or key provided to setData.");
    }

    try {
      const dataForId = map.get(testId) ?? ({} as T);
      dataForId[key] = value as T[keyof T];

      map.set(testId, dataForId);

      logger.info(`Key "${String(key)}" set to "${String(value)}" for testId: "${testId}".`);
    } catch (error) {
      errorHandler.logGeneralError(error, "setData");
      throw error;
    }
  }

  /**
   * Retrieves a value from the data map for a given testId.
   *
   * @throws if the key is not set for the testId
   *
   * @param map the map to retrieve the data from
   * @param testId the id of the test to retrieve the data for
   * @param key the key to retrieve the value for
   */
  public static getData<T extends Record<keyof T, string | number>>(
    map: Map<string, T>,
    testId: string,
    key: keyof T
  ): string | number | null {
    if (!testId || !key) {
      logger.error("Invalid testId or key provided to getData.");
      throw new Error("Invalid testId or key provided to getData.");
    }

    try {
      const dataForId = map.get(testId);
      if (!dataForId?.[key]) {
        logger.error(`Key "${String(key)}" is not set for testId: "${testId}".`);
        throw new Error(
          `Key "${String(key)}" is not set for testId: "${testId}".`
        );
      }

      return dataForId[key];
    } catch (error) {
      errorHandler.logGeneralError(error, "getData");
      throw error;
    }
  }
}
