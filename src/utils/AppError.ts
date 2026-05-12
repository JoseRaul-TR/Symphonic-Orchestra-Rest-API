// src/utils/AppError.ts

/**
 * Custom error class that carries an HTTP status code alongside the message.
 * Throwing an AppError anywhere in the application routes it to the central
 * errorHandler middleware, which maps it to the correct HTTP response.
 *
 * @example
 *   throw new AppError("Musikern hittades inte.", 404);
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    // Required in TypeScript when extending built-in classes
    // to restore the correct prototype chain after transpilation.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
