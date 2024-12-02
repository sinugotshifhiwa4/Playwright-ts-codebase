import { Locator, Page, expect, Response } from "@playwright/test";
import logger from "../../../utils/loggerUtil";
import * as fs from "fs";
import errorHandler from "../../../helpers/errorHandler";
import MapDataManager from "../../../helpers/mapDataManager";

export default class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Generic action handler that performs an action once.
   * @param action The action to be performed.
   * @param successMessage The success message to be logged.
   * @param errorMessage The error message to be logged.
   * @returns The result of the action.
   */
  async performAction<T>(
    action: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T> {
    try {
      const result = await action();
      if (successMessage) logger.info(successMessage);
      return result;
    } catch (error) {
      // Log the stack trace if available
      const stackTrace =
        error instanceof Error ? error.stack : "No stack trace available";
      errorHandler.logGeneralError(
        error,
        "performAction",
        `${errorMessage} | Stack Trace: ${stackTrace}`
      );
      throw error;
    }
  }

  /**
   * Navigation
   * @param url The URL to navigate to.
   * @returns The response object.
   */
  async navigateToUrl(url: string): Promise<Response | null> {
    try {
      return await this.performAction(
        () => this.page.goto(url),
        `Navigated to ${url}`,
        `Failed to navigate to ${url}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "navigateTo");
      throw error;
    }
  }

  /**
   * Element Interaction
   * @param element The element locator.
   * @param value The value to fill.
   * @param elementName The name of the element (optional).
   */
  async fillElement(element: Locator, value: string, elementName?: string) {
    try {
      const isCredentialField =
        elementName?.toLowerCase().includes("username") ||
        elementName?.toLowerCase().includes("password");

      await this.performAction(
        () => element.fill(value, { force: true }),
        isCredentialField
          ? `Credential ${elementName} filled successfully`
          : `${elementName} filled successfully with value: ${value}`,
        `Error entering text in ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "fillElement");
      throw error;
    }
  }

  /**
   * Element Interaction
   * @param element The element locator.
   * @param text The text to enter sequentially.
   * @param elementName The name of the element (optional).
   */
  async enterTextSequentially(
    element: Locator,
    text: string,
    elementName?: string
  ) {
    try {
      await this.performAction(
        async () => {
          await element.pressSequentially(text);
          logger.info(`Text entered sequentially in ${elementName}`);
        },
        `Text entered sequentially in ${elementName}`,
        `Error entering text sequentially in ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "enterTextSequentially");
      throw error;
    }
  }

  /**
   * Presses each digit in the given string sequentially on the given element,
   * focusing on the element before and blurring it after to mimic the user entering
   * the digits manually.
   * @param element The element locator.
   * @param digits The string of digits to press.
   * @param elementName The name of the element.
   */
  async pressDigitsInKeyboard(
    element: Locator,
    digits: string,
    elementName: string
  ) {
    try {
      await this.performAction(
        async () => {
          // Focus on the input field before entering digits
          await element.focus();
          logger.info(`Focused on ${elementName}`);

          // Press each digit in sequence
          for (const digit of digits) {
            await this.page.keyboard.press(digit);
            logger.info(`Pressed digit ${digit} in ${elementName}`);
          }

          // Trigger blur event to mimic the user moving out of the input
          await element.blur();
          logger.info(`Blurred ${elementName}`);
        },
        `Digits pressed sequentially in ${elementName}`,
        `Error pressing digits in ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "pressDigitsInKeyboard");
      throw error;
    }
  }

  /**
   * Element Interaction
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async clickElement(element: Locator, elementName?: string) {
    try {
      await this.performAction(
        () => element.click({ force: true }),
        `Clicked on ${elementName}`,
        `Error clicking on ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "clickElement");
      throw error;
    }
  }

  /**
   * Element Interaction
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async clearElement(element: Locator, elementName?: string) {
    try {
      await this.performAction(
        () => element.clear(),
        `Cleared ${elementName}`,
        `Error clearing ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "clearElement");
      throw error;
    }
  }

  /**
   * Get Text
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   * @returns The visible text of the element.
   */
  async getDisplayedTextFromElement(
    element: Locator,
    elementName?: string
  ): Promise<string> {
    try {
      return await this.performAction(
        async () => {
          const text = await element.innerText();
          logger.info(`Retrieved visible text from ${elementName}: ${text}`);
          return text;
        },
        `Visible text retrieved from ${elementName}`,
        `Error getting visible text from ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "getDisplayedTextFromElement");
      throw error;
    }
  }

  /**
   * Get Text
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   * @returns The all text of the element.
   */
  async getCompleteTextFromElement(
    element: Locator,
    elementName?: string
  ): Promise<string | null> {
    try {
      return await this.performAction(
        async () => {
          const text = await element.textContent();
          logger.info(`Retrieved all text from ${elementName}: ${text}`);
          return text;
        },
        `All text retrieved from ${elementName}`,
        `Error getting all text from ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "getCompleteTextFromElement");
      throw error;
    }
  }

  /**
   * Get Input Value
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   * @returns The input value of the element.
   */
  async getElementInputValue(
    element: Locator,
    elementName?: string
  ): Promise<string> {
    try {
      return await this.performAction(
        async () => {
          const value = await element.inputValue();
          logger.info(`Retrieved value from ${elementName}: ${value}`);
          return value;
        },
        `Value retrieved from ${elementName}`,
        `Error getting value from ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "getElementInputValue");
      throw error;
    }
  }

  /**
   * Verification
   * @param element The element locator.
   * @param expectedText The expected text.
   * @param elementName The name of the element (optional).
   */
  async verifyElementText(
    element: Locator,
    expectedText: string,
    elementName?: string
  ) {
    try {
      const actualText = await this.getDisplayedTextFromElement(
        element,
        elementName
      );
      expect(actualText.trim()).toBe(expectedText.trim());
      logger.info(
        `Verified text for ${elementName}. Expected: "${expectedText}", Actual: "${actualText}"`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "verifyElementText");
      throw error;
    }
  }

  /**
   * Verification
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async verifyElementVisible(
    element: Locator,
    elementName?: string
  ): Promise<boolean> {
    try {
      return this.performAction(
        async () => {
          await expect(element).toBeVisible();
          logger.info(`Verified that ${elementName} is visible`);
          return true;
        },
        `Element ${elementName} is visible`,
        `Failed to verify visibility of ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "verifyElementVisible");
      throw error;
    }
  }

  async isElementVisible(element: Locator): Promise<boolean> {
    try {
      return await element.isVisible();
    } catch (error) {
      errorHandler.logGeneralError(error, "isElementVisible");
      throw error;
    }
  }

  /**
   * Verification
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async verifyElementNotVisible(
    element: Locator,
    elementName?: string
  ): Promise<boolean> {
    try {
      await this.performAction(
        async () => {
          await expect(element).not.toBeVisible();
          logger.info(`Verified that ${elementName} is not visible`);
          return true;
        },
        `Element ${elementName} is not visible`,
        `Failed to verify invisibility of ${elementName}`
      );
      return true;
    } catch (error) {
      logger.error(`Failed to verify invisibility of ${elementName}: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for Element Visible
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async waitForElementVisible(element: Locator, elementName?: string) {
    try {
      await this.performAction(
        async () => {
          await element.waitFor({ state: "visible" });
          logger.info(`Waited for ${elementName} to be visible`);
          return true;
        },
        `Element ${elementName} is visible`,
        `Error waiting for ${elementName} to be visible`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "waitForElementVisible");
      throw error;
    }
  }

  /**
   * Wait for Element Hidden
   * @param selector The CSS selector.
   * @param elementName The name of the element (optional).
   */
  async waitForElementHidden(selector: string, elementName?: string) {
    try {
      await this.performAction(
        async () => {
          await this.page.waitForSelector(selector, { state: "hidden" });
          logger.info(`Waited for ${elementName} to be hidden`);
          return true;
        },
        `Element ${elementName} hidden`,
        `Error waiting for ${elementName} to be hidden`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "waitForElementHidden");
      throw error;
    }
  }

  /**
   * Take a screenshot of the current page.
   * @returns A promise that resolves with a Buffer containing the screenshot.
   * here is usage example:
   * step 1:  const screenshotBuffer = await basePage.takeScreenshot();
   * step 2: await testInfo.attach("screenshot", {
   *   body: screenshotBuffer,
   *   contentType: "image/png",
   * });
   */
  async takeScreenshot(screenshotName?: string): Promise<Buffer> {
    try {
      const screenshotBuffer = await this.performAction(
        () => this.page.screenshot(),
        `Screenshot of ${screenshotName} taken`,
        `Error taking screenshot`
      );
      return screenshotBuffer;
    } catch (error) {
      errorHandler.logGeneralError(error, "takeScreenshot: ${screenshotName}");
      throw error;
    }
  }

  /**
   * Element State Verification
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async verifyElementEnabled(element: Locator, elementName?: string) {
    try {
      await this.performAction(
        async () => {
          await expect(element).toBeEnabled();
          logger.info(`Verified that ${elementName} is enabled`);
        },
        `Element ${elementName} is enabled`,
        `Failed to verify element ${elementName} is enabled`
      );
      return true;
    } catch (error) {
      errorHandler.logGeneralError(error, "verifyElementEnabled");
      throw error;
    }
  }

  /**
   * Element State Verification
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async verifyElementDisabled(element: Locator, elementName?: string) {
    try {
      await this.performAction(
        async () => {
          await expect(element).toBeDisabled();
          logger.info(`Verified that ${elementName} is disabled`);
        },
        `Element ${elementName} is disabled`,
        `Failed to verify element ${elementName} is disabled`
      );
      return true;
    } catch (error) {
      errorHandler.logGeneralError(error, "verifyElementDisabled");
      throw error;
    }
  }

  /**
   * Element State Verification
   * @param element The element locator.
   * @param elementName The name of the element (optional).
   */
  async verifyElementEditable(element: Locator, elementName?: string) {
    try {
      const isEnabled = await element.isEnabled();
      const isReadOnly = await element.getAttribute("readonly");
      const isDisabled = await element.getAttribute("disabled");

      if (!isEnabled || isReadOnly !== null || isDisabled !== null) {
        logger.warn(`Element ${elementName} is not fully editable`);
      }

      expect(isEnabled).toBe(true);
      expect(isReadOnly).toBe(null);
      expect(isDisabled).toBe(null);

      logger.info(`Verified that ${elementName} is editable`);
    } catch (error) {
      errorHandler.logGeneralError(error, "verifyElementEditable");
      throw error;
    }
  }

  // Utility function can be static if not using instance variables
  public createRandomString(length: number): string {
    try {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    } catch (error) {
      errorHandler.logGeneralError(error, "createRandomString");
      throw error;
    }
  }

  /**
   * Select Dropdown Option
   * @param element The element locator.
   * @param optionValue The value of the option.
   * @param elementName The name of the element (optional).
   */
  async selectDropdownOption(
    element: Locator,
    optionValue: string,
    elementName?: string
  ) {
    try {
      // Remove any extra quotes from the optionValue
      const cleanOptionValue = optionValue.replace(/^"|"$/g, "");

      await this.performAction(
        () => element.selectOption(cleanOptionValue),
        `${elementName} option selected successfully with value: ${optionValue}`,
        `Error selecting option in ${elementName}`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "selectDropdownOption");
      throw error;
    }
  }

  /**
   * Verifies that a file exists at the specified path after download.
   *
   * This method checks the file system to ensure that the file has been
   * successfully downloaded to the given file path. It logs a success message
   * if the file is found, or an error message if the file is not found.
   *
   * @param filePath The path to the downloaded file.
   */
  async verifyDownloadedFile(filePath: string): Promise<void> {
    try {
      await this.performAction(
        async () => await fs.promises.access(filePath),
        `File successfully downloaded to: ${filePath}`,
        `File not found after download`
      );
    } catch (error) {
      errorHandler.logGeneralError(error, "verifyDownloadedFile");
      throw error;
    }
  }

  /**
   * Stores a value in the data map for a given testId.
   *
   * This method retrieves the value from an element specified by the elementLocator
   * and stores it in the data map associated with the given testId at the specified
   * key. It logs a success message if the value is stored successfully, or an error
   * message if an error occurs.
   *
   * @param map The map containing data objects associated with test identifiers.
   * @param testId The identifier of the test to store the data for.
   * @param fieldName The label of the element from which to retrieve the value.
   * @param elementLocator The locator of the element from which to retrieve the value.
   * @param dataKey The key at which to store the value in the data map.
   */
  async storeValueInMap<T>(
    map: Map<string, Record<keyof T, string | number>>,
    testId: string,
    fieldName: string,
    elementLocator: Locator,
    dataKey: keyof T
  ): Promise<void> {
    try {
      const value = await this.getElementInputValue(elementLocator, fieldName);

      if (value) {
        MapDataManager.setValueInMap(map, testId, dataKey, value);
      }
    } catch (error) {
      errorHandler.logGeneralError(error, "storeIncomeAndExpensesValue");
      throw error;
    }
  }

  /**
   * Retrieves the value from an element and logs a success or error message accordingly.
   *
   * @param elementLocator The locator of the element to retrieve the value from.
   * @param label The label of the element to retrieve the value from.
   * @returns The value retrieved from the element.
   * @throws {Error} If unable to fetch the value.
   */
  async getElementValue(
    elementLocator: Locator,
    label: string
  ): Promise<string> {
    try {
      const value = await this.getCompleteTextFromElement(
        elementLocator,
        label
      );
      if (value === null) {
        logger.error(
          `Error: Unable to fetch the "${label}" value. The retrieved value is null or undefined.`
        );
        throw new Error(
          `Failed to fetch the "${label}" value. The retrieved value is null or undefined.`
        );
      }
      logger.info(`Fetched ${label} Value: ${value}`);
      return value;
    } catch (error) {
      errorHandler.logGeneralError(
        error,
        "getSummaryValue",
        "Failed to fetch the value"
      );
      throw error;
    }
  }

  /**
   * Verifies if a given field is visible on the page.
   * @param field Locator pointing to the field to be verified.
   * @param fieldName Name of the field to be used in the logs.
   */
  async verifyFieldIsVisible(field: Locator, fieldName: string): Promise<void> {
    try {
      await this.verifyElementVisible(field, fieldName);
    } catch (error) {
      errorHandler.logGeneralError(error, "verifyFieldIsVisible");
      throw error;
    }
  }
}
