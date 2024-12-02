import winston from "winston";
import path from "path";
import moment from "moment-timezone";
import fs from "fs";

class LoggerUtil {
  
  // Singleton instance
  private static instance: winston.Logger;

  /**
   * Private constructor to prevent instantiation of this class.
   * This class is a singleton and should be accessed through the static
   * `getLogger` method.
   * @private
   */
  private constructor() {}

  /**
   * Gets the logger instance. If the logger has not been initialized before,
   * this method will initialize the logger.
   *
   * @returns {winston.Logger} The logger instance.
   */
  public static getLogger(): winston.Logger {
    if (!this.instance) {
      this.initializeLogger();
    }
    return this.instance;
  }

  /**
   * Initializes the logger instance. This method is called when the logger
   * instance is retrieved through the `getLogger` method for the first time.
   * The logger is configured with transports for writing to a file and
   * printing to the console. The log format is a custom format that includes
   * the timestamp in ISO 8601 format with timezone, the log level and the
   * log message. The timestamp format is used for both transports.
   *
   * @private
   */
  private static initializeLogger(): void {
    const currentDir = process.cwd();
    const loggingDir = path.join(currentDir, "logs");

    // Ensure the 'logs' directory exists
    if (!fs.existsSync(loggingDir)) {
      fs.mkdirSync(loggingDir);
    }

    // Custom log format
    const customFormat = winston.format.printf(
      ({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
      }
    );

    // Timestamp format in ISO 8601 with timezone
    const timestampFormat = winston.format.timestamp({
      format: () =>
        moment().tz("Africa/Johannesburg").format("YYYY-MM-DDTHH:mm:ssZ"),
    });

    // Info-level transport without date-based file naming
    const infoTransport = new winston.transports.File({
      filename: path.join(loggingDir, "log_info.log"),
      maxsize: 10 * 1024 * 1024, // Rotate when the file reaches 10 MB
      level: "info",
      format: winston.format.combine(timestampFormat, customFormat),
    });

    // Error-level transport with date-based naming and rotation
    const errorTransport = new winston.transports.File({
      filename: path.join(loggingDir, "test_error.log"),
      zippedArchive: true,
      level: "error",
      format: winston.format.combine(timestampFormat, customFormat),
    });

    // Error-level transport with date-based naming and rotation
    const debugTransport = new winston.transports.File({
      filename: path.join(loggingDir, "test_debug.log"),
      zippedArchive: true,
      level: "debug",
      format: winston.format.combine(timestampFormat, customFormat),
    });

    // Console transport
    const consoleTransport = new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        timestampFormat,
        winston.format.colorize(),
        customFormat
      ),
    });

    // Create the logger with both transports
    this.instance = winston.createLogger({
      transports: [
        infoTransport,
        errorTransport,
        debugTransport,
        consoleTransport,
      ],
    });
  }
}

// Export the logger instance
const logger = LoggerUtil.getLogger();

export default logger;
