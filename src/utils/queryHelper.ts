// src/utils/queryHelper.ts
/**
 * Dynamically constructs the WHERE clause and parameters for MySQL.
 * Filters sort keys and null/undefined values.
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
