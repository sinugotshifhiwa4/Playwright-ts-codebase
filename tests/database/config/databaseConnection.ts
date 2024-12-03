import sql from "mssql";
import { DefaultAzureCredential } from "@azure/identity";
import ENV from "../../utils/envVariables";
import errorHandler from "../../helpers/errorHandler";
import logger from "../../utils/loggerUtil";


export default class DatabaseConnection {

  // Connection pool
  private static pool: sql.ConnectionPool | null = null;

  /**
   * Retrieves an access token using Azure identity credentials.
   * The token is obtained from the Azure DB endpoint specified in the environment variables.
   * Logs the retrieval process and handles any errors by logging and rethrowing them.
   *
   * @returns A promise that resolves to the access token as a string.
   * @throws Will throw an error if there is an issue retrieving the token.
   */
  private static async getAccessToken(): Promise<string> {
    const credential = new DefaultAzureCredential();
    try {
      const tokenResponse = await credential.getToken(ENV.AZURE_DB_ENDPOINT!);
      // Validate token response (you could inject this if necessary)
      if (!tokenResponse) {
        throw new Error("Failed to retrieve token response");
      }
      logger.info(`Access token retrieved successfully.`);
      return tokenResponse.token;
    } catch (error) {
      errorHandler.logDatabaseError(error, "getAccessToken");
      throw error;
    }
  }

  /**
   * Constructs and returns the database configuration object required for SQL connection.
   * This configuration includes server, port, and database information, and specifies options
   * for encryption and authentication with an Azure Active Directory access token.
   *
   * @param accessToken - The Azure Active Directory access token used for authentication.
   * @returns The SQL connection configuration object.
   */
  private static getDatabaseConfig(accessToken: string): sql.config {
    try {
      return {
        server: ENV.SERVER!,
        port: parseInt(ENV.PORT!, 10),
        database: ENV.DATABASE!,
        options: {
          encrypt: true,
          trustServerCertificate: false,
          enableArithAbort: true,
        },
        authentication: {
          type: "azure-active-directory-access-token",
          options: {
            token: accessToken,
          },
        },
        pool: {
          // Optional, but recommended for performance
          max: 10, // Maximum number of connections in the pool
          min: 0, // Minimum number of connections in the pool
          idleTimeoutMillis: 30000, // Time in milliseconds to wait before closing idle connections
        },
      };
    } catch (error) {
      errorHandler.logDatabaseError(error, "getDatabaseConfig");
      throw error;
    }
  }

  /**
   * Establishes a connection to the database using Azure Active Directory access token
   * authentication. Retrieves the access token, constructs the database configuration,
   * and attempts to connect using the configuration. Logs a success message if the
   * connection is established. If an error occurs, logs the error and returns null.
   *
   * @returns A promise that resolves to the SQL connection pool if successful, otherwise null.
   * @throws Logs any errors encountered during the connection process.
   */
  private static async establishDatabaseConnection(): Promise<sql.ConnectionPool | null> {
    try {
      const accessToken = await this.getAccessToken();
      const config = this.getDatabaseConfig(accessToken);
      this.pool = await sql.connect(config);
      logger.info(`Connected to the database successfully.`);
      return this.pool;
    } catch (error) {
      errorHandler.logDatabaseError(
        error,
        "establishDatabaseConnection",
        "Error connecting to the database"
      );
      throw error;
    }
  }

  /**
   * Retrieves the database connection pool. If the connection pool is not
   * already established, it attempts to establish a new connection using
   * Azure Active Directory access token authentication. If successful, the
   * connection pool is cached for future use. Logs any errors encountered
   * during the process and propagates the error.
   *
   * @returns A promise that resolves to the SQL connection pool if successful,
   *          otherwise null.
   * @throws Will throw an error if there is an issue establishing the connection.
   */
  public static async getConnectionPool(): Promise<sql.ConnectionPool | null> {
    try {
      if (!this.pool) {
        this.pool = await this.establishDatabaseConnection();
      }
      return this.pool;
    } catch (error) {
      errorHandler.logDatabaseError(error, "getConnectionPool");
      throw error;
    }
  }

  /**
   * Closes the database connection pool if it is currently open.
   * Logs a message indicating the pool was closed, or logs a warning
   * if the pool was already closed. If an error occurs during the
   * closing process, it logs the error.
   *
   * @returns A promise that resolves when the connection pool is closed.
   */
  public static async closeConnectionPool(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close();
        this.pool = null;
        logger.info(`Database connection closed.`);
      } catch (error) {
        errorHandler.logDatabaseError(error, "closeConnectionPool");
        throw error;
      }
    } else {
      logger.warn(
        `Attempted to close the connection pool, but it was already closed.`
      );
    }
  }
}
