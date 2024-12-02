import { test } from "@playwright/test";
import EncryptionManager from "../encryption/encryptionManager";
import * as envFiles from "../models/envFilePath";
import ENV from "../utils/envVariables";
import logger from "../utils/loggerUtil";

test.describe("Encryption Test Suite", () => {
  test("Encryption Test", async () => {
    EncryptionManager.encryptEnvironmentVariables(
      envFiles.ENV_FILES.uat,
      ENV.SECRET_KEY_UAT
    ); // Replace with your desired env from envFilePath under models folder
    logger.info(`Environment variables encrypted successfully.`);
  });
});
