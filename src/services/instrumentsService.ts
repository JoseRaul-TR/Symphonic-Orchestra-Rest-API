// src/services/instrumentsService.ts
import { query } from "../config/db.ts";
import { buildWhereClause } from "../utils/queryHelper.ts";
import { AppError } from "../utils/AppError.ts";
import type {
  CreateInstrumentDTO,
  Instrument,
  InstrumentFilters,
  InstrumentWithOwner,
} from "../types/instruments.ts";
import { buildPaginationMeta } from "../utils/pagination.ts";
import type { PaginatedResult } from "../types/pagination.ts";

const FILTERABLE_COLUMNS = new Set(["type", "brand", "owner_type", "owner_id"]);

const ALLOWED_SORT_COLUMNS = new Set([
  "type",
  "brand",
  "purchase_price",
  "estimated_value",
  "manufacture_year",
  "purchase_date",
  "sell_date",
  "sell_price",
  "owner_type",
  "rent_fee_per_day",
]);

const UPDATABLE_FIELDS: (keyof CreateInstrumentDTO)[] = [
  "type",
  "brand",
  "model",
  "serial_number",
  "purchase_price",
  "estimated_value",
  "manufacture_year",
  "purchase_date",
  "sell_date",
  "sell_price",
  "owner_type",
  "owner_id",
  "rent_fee_per_day",
];

/**
 * Builds a safe SQL ORDER BY clause from validated sort parameters.
 *
 * @param sortBy     - Column name or the virtual alias "value"
 * @param order      - Sort direction (ASC / DESC)
 * @param tableAlias - Optional table alias prefix for JOIN queries (e.g. "i" → "i.column").
 *                     Omit for simple single-table SELECT statements.
 *
 * Supports the virtual field "value" which sorts by estimated_value
 * with purchase_price as fallback via COALESCE.
 *
 * @throws AppError 400 if sortBy is not in the whitelist
 */
const buildOrderClause = (
  sortBy?: string,
  order?: "ASC" | "DESC",
  tableAlias?: string,
): string => {
  if (!sortBy) return "";

  const isValue = sortBy === "value";

  if (!isValue && !ALLOWED_SORT_COLUMNS.has(sortBy)) {
    throw new AppError("Ogiltigt sorteringsfält.", 400);
  }

  const prefix = tableAlias ? `${tableAlias}.` : "";
  const column = isValue
    ? `COALESCE(${prefix}estimated_value, ${prefix}purchase_price)`
    : `${prefix}${sortBy}`;

  return ` ORDER BY ${column} ${order === "DESC" ? "DESC" : "ASC"}`;
};

export const instrumentsService = {
  /** Returns a paginated list of instruments with optional filters and sorting. */
  getAll: async (
    filters: InstrumentFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Instrument>> => {
    const { whereSql, params } = buildWhereClause(filters, FILTERABLE_COLUMNS);

    const countRows = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total FROM instruments${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.total ?? 0);

    let sql = `SELECT * FROM instruments${whereSql}`;
    sql += buildOrderClause(filters.sortBy, filters.order);

    const offset = (page - 1) * limit;
    sql += " LIMIT ? OFFSET ?";

    const data = await query<Instrument[]>(sql, [...params, limit, offset]);
    return {
      data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  getByID: async (id: number): Promise<Instrument | null> => {
    const rows = await query<Instrument[]>(
      "SELECT * FROM instruments WHERE id = ?",
      [id],
    );
    return rows[0] ?? null;
  },

  create: async (data: CreateInstrumentDTO): Promise<Instrument> => {
    const values = UPDATABLE_FIELDS.map((f) => data[f] ?? null);
    const sql = `INSERT INTO instruments (${UPDATABLE_FIELDS.join(", ")}) VALUES (${UPDATABLE_FIELDS.map(() => "?").join(", ")})`;
    const result = await query<{ insertId: number }>(sql, values);

    const created = await instrumentsService.getByID(result.insertId);
    if (!created)
      throw new AppError("Kunde inte hämta det skapade instrumentet.", 500);
    return created;
  },

  update: async (
    id: number,
    data: Partial<CreateInstrumentDTO>,
  ): Promise<Instrument | null> => {
    const fields = UPDATABLE_FIELDS.filter((f) => f in data);
    if (fields.length === 0) return instrumentsService.getByID(id);

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = [...fields.map((f) => data[f] ?? null), id];
    await query(`UPDATE instruments SET ${setClause} WHERE id = ?`, values);
    return instrumentsService.getByID(id);
  },

  delete: async (id: number): Promise<boolean> => {
    const result = await query<{ affectedRows: number }>(
      "DELETE FROM instruments WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  /**
   * Returns the full instrument inventory joined with musician owner data.
   * Supports the same filter and sort options as getAll.
   * Uses table alias "i" to disambiguate column names in the JOIN.
   */
  getInventoryWithOwners: async (
    filters: InstrumentFilters,
  ): Promise<InstrumentWithOwner[]> => {
    const { whereSql, params } = buildWhereClause(filters, FILTERABLE_COLUMNS);

    // Prefix each column reference in WHERE with "i." to avoid ambiguity in the JOIN
    const aliasedWhere = whereSql.replace(
      /(\bWHERE\b|\bAND\b)\s+(\w+)/g,
      "$1 i.$2",
    );

    let sql =
      `SELECT i.*, m.surname AS owner_surname, m.name AS owner_name` +
      ` FROM instruments i` +
      `LEFT JOIN musicians m ON i.owner_id = m.id` +
      aliasedWhere +
      buildOrderClause(filters.sortBy, filters.order, "i");

    return await query<InstrumentWithOwner[]>(sql, params);
  },
};
