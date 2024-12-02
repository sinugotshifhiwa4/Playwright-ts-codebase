class DatabaseErrorTypes extends Error {
  /**
   * Constructs a DatabaseErrorTypes object
   * @param type - The type of database error. One of "ConnectionError", "QueryError", or "TransactionError"
   * @param details - Additional information about the error. Optional
   */
  constructor(
    public type: "ConnectionError" | "QueryError" | "TransactionError",
    public details?: Record<string, unknown>
  ) {
    super(type);
    this.name = "DatabaseError";
  }
}

export default DatabaseErrorTypes;
