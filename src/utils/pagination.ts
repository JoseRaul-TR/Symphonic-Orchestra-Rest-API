// src/utils/pagination.ts
import type { PaginationMeta } from "../types/pagination.ts";

/**
 * Safely parses a pagination query parameter to a positive integer.
 * Returns `def` if the value is absent, non-numeric, or zero.
 *
 * @param val   - Raw value from req.query (unknown type)
 * @param def   - Default value to use as fallback
 * @returns       Parsed positive integer or the default
 *
 * @example
 *   parsePaginationParam("3", 1)      // → 3
 *   parsePaginationParam(undefined, 1) // → 1
 *   parsePaginationParam("abc", 20)   // → 20
 */
export const parsePaginationParam = (val: unknown, def: number): number =>
  parseInt(String(val ?? def)) || def;

/**
 * Builds the pagination metadata object from query results.
 * Centralizes the calculation so both services stay in sync.
 *
 * @param total  - Total number of records matching the current filters (from COUNT query)
 * @param page   - Current page number (1-based)
 * @param limit  - Number of records per page
 * @returns        PaginationMeta with totals, flags and page count
 */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
