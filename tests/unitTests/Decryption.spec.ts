import { test } from "@playwright/test";
import ENV from "../utils/envVariables";
import CryptoManager from "../helpers/cryptoManager";
import logger from "../utils/loggerUtil";

test.describe("Decryption Test Suite", () => {
  test.only("Decryption Test", async ({ page }) => {
    await page.goto(CryptoManager.decrypt(ENV.PORTAL_URL, ENV.SECRET_KEY_UAT));
    await page.waitForURL(
      CryptoManager.decrypt(ENV.PORTAL_URL, ENV.SECRET_KEY_UAT)
    );
    logger.info(
      `Navigated to ${CryptoManager.decrypt(
        ENV.PORTAL_URL,
        ENV.SECRET_KEY_UAT
      )}`
    ); // Replace with your desired env from envFilePath under models folder
    logger.info(`Page title: ${await page.title()}`);
  });
});
