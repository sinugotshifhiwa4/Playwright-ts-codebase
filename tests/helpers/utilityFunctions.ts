import errorHandler from "./errorHandler";

class UtilityFunctions {
  /**
   * Returns the element at the specified reversed index from the array.
   *
   * @param arr - The array from which to retrieve the element.
   * @param index - The index from the end of the array.
   * @returns The element at the reversed index.
   * @throws If the index is out of bounds.
   */
  public getReversedData(arr: string[], index: number): string {
    try {
      return arr[arr.length - 1 - index];
    } catch (error) {
      errorHandler.logGeneralError(error, "getReversedData");
      throw error;
    }
  }

  /**
   * Normalizes a string by trimming leading and trailing whitespace
   * and replacing multiple spaces with a single space.
   *
   * @param str - The input string to be normalized.
   * @returns The normalized string.
   */
  public normalizeString(str: string): string {
    try {
      return str.trim().replace(/\s+/g, " ");
    } catch (error) {
      errorHandler.logGeneralError(error, "normalizeString");
      throw error;
    }
  }

  /**
   * Replaces "R " and all whitespace characters in the given string, if it exists.
   *
   * @param value - The string to be processed.
   * @returns The processed string.
   */
  public safeReplace(value: string | null | undefined): string {
    try {
      return (value ?? "").replace(/R\s/g, "").replace(/\s/g, "");
    } catch (error) {
      errorHandler.logGeneralError(error, "safeReplace");
      throw error;
    }
  }
}

export default new UtilityFunctions();
