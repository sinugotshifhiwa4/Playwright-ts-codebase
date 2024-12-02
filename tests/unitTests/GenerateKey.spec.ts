import { test } from "@playwright/test";
import EncryptionManager from "../encryption/encryptionManager";
import * as envFiles from "../models/envFilePath";
import logger from "../utils/loggerUtil";

test.describe("Generate Secret Key Test Suite", () => {
  test(`Generate Secret Key`, async () => {
    EncryptionManager.generateAndStoreKey(envFiles.Environments.SECRET_KEY_UAT); // Replace with your desired env from envFilePath under models folder
    logger.info(`Secret key generated and saved successfully.`);
  });
});
