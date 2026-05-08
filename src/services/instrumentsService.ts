// src/services/instrumentsService.ts
import { query } from "../config/db.ts";
import type { Instrument, InstrumentWithOwner } from "../types/instrument.ts";

export const instrumentsService = {
  // GET /api/instruments/ (with filters)
  getAll: async (type?: string): Promise<Instrument[]> => {
    let sql = "SELECT * FROM instruments";
    const params: any[] = [];

    if (type) {
      sql += " WHERE type = ?";
      params.push(type);
    }
    return await query<Instrument[]>(sql, params);
  },

  // Combined fetch with metadata
  getInventoryWithOwners: async (): Promise<InstrumentWithOwner[]> => {
    const sql =
      "SELECT i.*, m.name AS owner_name, m.surname AS owner_surname FROM instruments i LEFT JOIN musicians m ON i.owner_id = m.id";
    return await query<InstrumentWithOwner[]>(sql);
  },

  getById: async (id: number): Promise<Instrument | null> => {
    const rows = await query<Instrument[]>(
      "SELECT * FROM instruments WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  },
};
