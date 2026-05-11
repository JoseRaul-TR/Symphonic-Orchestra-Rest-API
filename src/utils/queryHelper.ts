// src/utils/queryHelper.ts

/**
 * Dynamically builds a SQL WHERE clause from a filters object.
 *
 * Only columns present in `allowedColumns` are included — this whitelist
 * prevents SQL injection through arbitrary key names since column identifiers
 * cannot be parameterized with `?` placeholders in MySQL.
 *
 * Keys `sortBy` and `order` are always ignored (handled separately in services).
 * Keys with null or undefined values are skipped (treated as "no filter").
 *
 * @param filters        - Raw filter object, typically from req.query
 * @param allowedColumns - Set of column names permitted to appear in WHERE
 * @returns                Object with the SQL fragment and its bound parameters
 *
 * @example
 *   buildWhereClause({ section: "Strings", sortBy: "name" }, FILTERABLE_COLUMNS)
 *    → { whereSql: " WHERE section = ?", params: ["Strings"] }
 */
export const buildWhereClause = (
  filters: Record<string, any>,
  allowedColumns: ReadonlySet<string>,
) => {
  const conditions: string[] = [];
  const params: any[] = [];

  const ignoredKeys = new Set(["sortBy", "order"]);

  for (const [key, value] of Object.entries(filters)) {
    if (ignoredKeys.has(key) || value === undefined || value === null) continue;
    if (!allowedColumns.has(key)) continue;
    conditions.push(`${key} = ?`);
    params.push(value);
  }

  return {
    whereSql: conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
};
