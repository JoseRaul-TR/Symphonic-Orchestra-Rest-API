// src/utils/AppError.js
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    // Needed in TS when Error is extended to keep the chain of prototypes
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
