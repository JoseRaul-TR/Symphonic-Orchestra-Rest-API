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

export const instrumentsService = {
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

    if (filters.sortBy) {
      const isValue = filters.sortBy === "value";
      if (!isValue && !ALLOWED_SORT_COLUMNS.has(filters.sortBy)) {
        throw new AppError("Ogiltigt sorteringsfält.", 400);
      }
      const col = isValue
        ? "COALESCE(estimated_value, purchase_price)"
        : filters.sortBy;
      const order = filters.order === "DESC" ? "DESC" : "ASC";
      sql += ` ORDER BY ${col} ${order}`;
    }

    const offset = (page - 1) * limit;
    sql += " LIMIT ? OFFSET ?";

    const data = await query<Instrument[]>(sql, [...params, limit, offset]);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
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

  getInventoryWithOwners: async (): Promise<InstrumentWithOwner[]> => {
    return await query<InstrumentWithOwner[]>(
      `SELECT i.*, m.name AS owner_name, m.surname AS owner_surname
       FROM instruments i
       LEFT JOIN musicians m ON i.owner_id = m.id`,
    );
  },
};
