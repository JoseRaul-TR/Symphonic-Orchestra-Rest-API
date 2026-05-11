// src/services/musiciansService.ts
import { query } from "../config/db.ts";
import { buildWhereClause } from "../utils/queryHelper.ts";
import { AppError } from "../utils/AppError.ts";
import type {
  Musician,
  CreateMusicianDTO,
  MusicianFilters,
  Section,
} from "../types/musicians.ts";
import { buildPaginationMeta } from "../utils/pagination.ts";
import type { PaginatedResult } from "../types/pagination.ts";

type MusicianOverview = {
  total_musicians: number;
  orchestra_members: number;
  non_members: number;
  avg_salary_per_day: number | null;
};

type SectionStats = {
  section: Section | null;
  total: number;
  avg_salary: number | null;
  min_salary: number | null;
  max_salary: number | null;
};

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
  getAll: async (
    filters: MusicianFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Musician>> => {
    const { whereSql, params } = buildWhereClause(filters, FILTERABLE_COLUMNS);

    const countRows = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total FROM musicians${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.total ?? 0);

    let sql = `SELECT * FROM musicians${whereSql}`;

    if (filters.sortBy && ALLOWED_SORT_COLUMNS.has(filters.sortBy)) {
      const order = filters.order === "DESC" ? "DESC" : "ASC";
      sql += ` ORDER BY ${filters.sortBy} ${order}`;
    }

    const offset = (page - 1) * limit;
    sql += " LIMIT ? OFFSET ?";

    const data = await query<Musician[]>(sql, [...params, limit, offset]);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  getStats: async () => {
    const [overview] = await query<MusicianOverview[]>(
      `SELECT
        COUNT(*)                          AS total_musicians,
        SUM(orchestra_member)             AS orchestra_members,
        COUNT(*) - SUM(orchestra_member)  AS non_members,
        ROUND(AVG(salary_per_day), 2)     AS avg_salary_per_day
       FROM musicians`,
    );

    const bySection = await query<SectionStats[]>(
      `SELECT
        section,
        COUNT(*)                      AS total,
        ROUND(AVG(salary_per_day), 2) AS avg_salary,
        MIN(salary_per_day)           AS min_salary,
        MAX(salary_per_day)           AS max_salary
       FROM musicians
       WHERE orchestra_member = 1
       GROUP BY section
       ORDER BY total DESC`,
    );

    return { overview, bySection };
  },

  getByID: async (id: number): Promise<Musician | null> => {
    const rows = await query<Musician[]>(
      "SELECT * FROM musicians WHERE id = ?",
      [id],
    );
    return rows[0] ?? null;
  },

  create: async (data: CreateMusicianDTO): Promise<Musician> => {
    const placeholders = UPDATABLE_FIELDS.map(() => "?").join(", ");
    const values = UPDATABLE_FIELDS.map((f) => data[f] ?? null);

    const result = await query<{ insertId: number }>(
      `INSERT INTO musicians (${UPDATABLE_FIELDS.join(", ")}) VALUES (${placeholders})`,
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
