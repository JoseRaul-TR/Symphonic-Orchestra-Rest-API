// src/services/musiciansService.ts
import { query } from "../config/db.ts";
import { buildWhereClause } from "../utils/queryHelper.ts";
import type {
  Musician,
  CreateMusicianDTO,
  MusicianFilters,
} from "../types/musicians.ts";
import { AppError } from "../utils/AppError.ts";

const FILTERABLE_COLUMNS = new Set([
  "orchestra_member",
  "nationality",
  "section",
  "main_instrument",
  "role",
]);

const ALLOWED_SORT_COLUMNS = new Set([
  "name",
  "surname",
  "nationality",
  "join_date",
  "section",
  "main_instrument",
  "role",
  "salary_per_day",
]);

const UPDATABLE_FIELDS: (keyof CreateMusicianDTO)[] = [
  "name",
  "surname",
  "birth_date",
  "orchestra_member",
  "join_date",
  "nationality",
  "section",
  "main_instrument",
  "role",
  "salary_per_day",
];

export const musiciansService = {
  getAll: async (filters: MusicianFilters): Promise<Musician[]> => {
    const { whereSql, params } = buildWhereClause(filters, FILTERABLE_COLUMNS);
    let sql = `SELECT * FROM musicians${whereSql}`;

    if (filters.sortBy && ALLOWED_SORT_COLUMNS.has(filters.sortBy)) {
      const order = filters.order === "DESC" ? "DESC" : "ASC";
      sql += ` ORDER BY ${filters.sortBy} ${order}`;
    }

    return await query<Musician[]>(sql, params);
  },

  getByID: async (id: number): Promise<Musician | null> => {
    const rows = await query<Musician[]>(
      "SELECT * FROM musicians WHERE id = ?",
      [id],
    );
    return rows[0] ?? null;
  },

  create: async (data: CreateMusicianDTO): Promise<Musician> => {
    const fields = UPDATABLE_FIELDS;
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((f) => data[f] ?? null);

    const result = await query<{ insertId: number }>(
      `INSERT INTO musicians (${fields.join(", ")}) VALUES (${placeholders})`,
      values,
    );

    const created = await musiciansService.getByID(result.insertId);
    if (!created)
      throw new AppError("Kunde inte hämta den skapade musikern.", 500);
    return created;
  },

  update: async (
    id: number,
    data: Partial<CreateMusicianDTO>,
  ): Promise<Musician | null> => {
    const fields = UPDATABLE_FIELDS.filter((f) => f in data);
    if (fields.length === 0) return musiciansService.getByID(id);

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = [...fields.map((f) => data[f] ?? null), id];

    await query(`UPDATE musicians SET ${setClause} WHERE id = ?`, values);
    return musiciansService.getByID(id);
  },

  delete: async (id: number): Promise<boolean> => {
    const result = await query<{ affectedRows: number }>(
      "DELETE FROM musicians WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },
};
