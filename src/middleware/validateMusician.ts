// src/middleware/validateMusician.ts
import { AppError } from "../utils/AppError.ts";
import type { CreateMusicianDTO } from "../types/musicians.ts";

type MusicianData = Partial<CreateMusicianDTO>;

// Fields that orchestra members MUST provide (mirrors chk_member_fields)
const MEMBER_REQUIRED = [
  "section",
  "main_instrument",
  "role",
  "salary_per_day",
] as const;

// Fields that are exclusive to orchestra members (mirrors chk_non_member + chk_join_date)
const MEMBER_ONLY = [...MEMBER_REQUIRED, "join_date"] as const;

/**
 * Validates musician data against the three CHECK constraints defined in MySQL.
 * Called before INSERT (create) and after merging current + patch data (update),
 * returning a clear 400 error before the query reaches the database.
 *
 * Rules enforced:
 *   chk_member_fields → orchestra members MUST have section, main_instrument,
 *                        role and salary_per_day.
 *   chk_non_member    → non-members MUST NOT have those fields.
 *   chk_join_date     → non-members MUST NOT have a join_date.
 *
 * If orchestra_member is absent from the payload (undefined), the function
 * returns early — used safely in partial PATCH updates where orchestra_member
 * is not being changed.
 *
 * @param data - Full or partial musician payload to validate
 * @throws AppError 400 if any constraint is violated
 */
export const validateMusicianRules = (data: MusicianData): void => {
  if (data.orchestra_member === undefined) return;

  if (data.orchestra_member) {
    const missing = MEMBER_REQUIRED.filter(
      (f) => data[f] === undefined || data[f] === null,
    );
    if (missing.length > 0) {
      throw new AppError(
        `Orkestermedlemmar måste ha: ${missing.join(", ")}.`,
        400,
      );
    }
  } else {
    const forbidden = MEMBER_ONLY.filter(
      (f) => data[f] !== undefined && data[f] !== null,
    );
    if (forbidden.length > 0) {
      throw new AppError(
        `Icke-medlemmar får inte ha: ${forbidden.join(", ")}.`,
        400,
      );
    }
  }
};
