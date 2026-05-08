// src/services/instrumentsService.ts
import { query } from "../config/db.ts";
import { buildWhereClause } from "../utils/queryHelper.ts";
import type {
  CreateInstrumentDTO,
  Instrument,
  InstrumentFilters,
} from "../types/instruments.ts";
import { AppError } from "../utils/AppError.ts";

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

export const instrumentsService = {
  /** Get all instruments with dynamic filters and sort options */
  getAll: async (filters: InstrumentFilters) => {
    const { whereSql, params } = buildWhereClause(filters, FILTERABLE_COLUMNS);
    let sql = `SELECT * FROM instruments${whereSql}`;

    if (filters.sortBy) {
      const isValue = filters.sortBy === "value";
      const safeCol = isValue
        ? "COALESCE(estimated_value, purchase_price)"
        : null;

      if (!isValue && !ALLOWED_SORT_COLUMNS.has(filters.sortBy)) {
        throw new AppError("Ogiltigt sorteringsfält.", 400);
      }

      const col = safeCol ?? filters.sortBy;
      const order = filters.order === "DESC" ? "DESC" : "ASC";
      sql += ` ORDER BY ${col} ${order}`;
    }
    return await query(sql, params);
  },

  getByID: async (id: number) => {
    const rows = await query("SELECT * FROM instruments WHERE id = ?", [id]);
    return rows[0] ?? null;
  },

  /** Inserts a new instrument using only allowed fields */
  create: async (data: CreateInstrumentDTO): Promise<Instrument> => {
    const fields = UPDATABLE_FIELDS;
    const values = fields.map((f) => data[f] ?? null);
    const sql = `INSERT INTO instruments (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`;
    const result = await query<{ insertId: number }>(sql, values);

    const created = await instrumentsService.getByID(result.insertId);
    if (!created)
      throw new AppError("Kunde inte hämta det skapade instrumentet.", 500);
    return created;
  },

  /** Updates only the fields present in the body that are in the whitelist */
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

  delete: async (id: number) => {
    const result = await query<{ affectedRows: number }>(
      "DELETE FROM instruments WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  getInventoryWithOwners: async () => {
    const sql =
      "SELECT i.*, m.name AS owner_name, m.surname AS owner_surname FROM instruments i LEFT JOIN musicians m ON i.owner_id = m.id";
    return await query(sql);
  },
};
