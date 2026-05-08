// src/services/musiciansService.ts

import { query } from "../config/db.ts";
import type {
  Musician,
  CreateMusicianDTO,
  Section,
  MainInstrument,
  Role,
} from "../types/musicians.ts";

// Whitelist - prevents SQL injection in ORDER getById
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

// Whitelist – prevents injecting arbitrary columns in UPDATE SET
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

export interface MusicianFilters {
  orchestra_member?: boolean;
  nationality?: string;
  section?: Section;
  main_instrument?: MainInstrument;
  role?: Role;
  sortBy?: string;
  order?: "ASC" | "DESC";
}

// Internal type for MySQL INSERT/UPDATE/DELETE result
interface MutationResult {
  insertId: number;
  affectedRows: number;
}

export const musiciansService = {
  // GET /api/musicians/ - filters + sorting
  getAll: async (filters: MusicianFilters): Promise<Musician[]> => {
    let sql = "SELECT * FROM musicians";
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (filters.orchestra_member !== undefined) {
      conditions.push("orchestra_member = ?");
      params.push(filters.orchestra_member);
    }
    if (filters.nationality) {
      conditions.push("nationality = ?");
      params.push(filters.nationality);
    }
    if (filters.section) {
      conditions.push("section = ?");
      params.push(filters.section);
    }
    if (filters.main_instrument) {
      conditions.push("main_instrument = ?");
      params.push(filters.main_instrument);
    }
    if (filters.role) {
      conditions.push("role = ?");
      params.push(filters.role);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    // Safe sort - only whitelisted column names are interpolated
    if (filters.sortBy && ALLOWED_SORT_COLUMNS.has(filters.sortBy)) {
      const order = filters.order === "DESC" ? "DESC" : "ASC";
      sql += ` ORDER BY ${filters.sortBy} ${order}`;
    }

    return await query<Musician[]>(sql, params);
  },

  // GET /api/musicians/:id
  getByID: async (id: number): Promise<Musician | null> => {
    const rows = await query<Musician[]>(
      "SELECT * FROM musicians WHERE id = ?",
      [id],
    );
    return rows[0] ?? null;
  },

  // POST /api/musicians/
  create: async (data: CreateMusicianDTO): Promise<Musician> => {
    const {
      name,
      surname,
      birth_date,
      orchestra_member,
      join_date,
      nationality,
      section,
      main_instrument,
      role,
      salary_per_day,
    } = data;

    const result = await query<MutationResult>(
      `INSERT INTO musicians (name, surname, birth_date, orchestra_member, join_date, nationality, section, main_instrument, role, salary_per_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.surname,
        data.birth_date,
        data.orchestra_member,
        data.join_date ?? null,
        data.nationality,
        data.section ?? null,
        data.main_instrument ?? null,
        data.role ?? null,
        data.salary_per_day ?? null,
      ],
    );

    const created = await musiciansService.getByID(result.insertId);
    if (!created) throw new Error("Musikern kunde inte skapas.");
    return created;
  },

  // PUT/PATCH /api/musicians/:id – partial update (safe field whitelist)
  update: async (
    id: number,
    data: Partial<CreateMusicianDTO>,
  ): Promise<Musician | null> => {
    // Only keep fields that exist both in whitelist and in the incoming payload
    const fields = UPDATABLE_FIELDS.filter((f) => f in data);

    if (fields.length === 0) {
      // Nothing to update – returns current state
      return musiciansService.getByID(id);
    }

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values: unknown[] = fields.map((f) => data[f] ?? null);
    values.push(id);

    await query<MutationResult>(
      `UPDATE musicians SET ${setClause} WHERE id = ?`,
      values,
    );

    return musiciansService.getByID(id);
  },

  // DELETE /api/musicians/:id
  delete: async (id: number): Promise<boolean> => {
    const result = await query<MutationResult>(
      "DELETE FROM musicians WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },
};
