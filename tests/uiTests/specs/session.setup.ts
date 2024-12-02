import { test as setup } from "@playwright/test"; // if you add fixtures them you will import from fixtures path
import logger from "../../utils/loggerUtil";

setup(`Authenticated`, async ({ page }) => {
  // Step 1: Navigate to the company portal

  // Step 2: Check if the company logo is visible on the login page

  // Step 3: Log in to the application using decrypted credentials (username and password)

  // Step 4: Check if the landing page locator is visible, confirming successful login and add successful login message to log

  logger.info(`Login Successful`);

  // Step 5: Save the authentication state (session) to a file for reuse in future tests and add message to log
  await page.context().storageState({ path: `.auth/login.json` });
  logger.info(`Session setup completed and saved`);
});
