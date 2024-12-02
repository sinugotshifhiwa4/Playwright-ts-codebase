export enum Environments {
  ENV_DIR = "envs",
  BASE_ENV_FILE = ".env",
  DEV_ENV_FILE = ".env.dev",
  UAT_ENV_FILE = ".env.uat",
  PROD_ENV_FILE = ".env.prod",
  SECRET_KEY_DEV = "SECRET_KEY_DEV",
  SECRET_KEY_UAT = "SECRET_KEY_UAT",
  SECRET_KEY_PROD = "SECRET_KEY_PROD",
}

export const ENV_FILES = {
  dev: Environments.DEV_ENV_FILE,
  uat: Environments.UAT_ENV_FILE,
  prod: Environments.PROD_ENV_FILE,
};