// src/middleware/validateMusicians.ts

// Mirrors the three CHECK constraints defined in the musicians table:
//
//   chk_join_date    → non-members cannot have a join_date
//   chk_member_fields → members MUST have section, main_instrument, role, salary_per_day
//   chk_non_member   → non-members MUST NOT have those fields

import { AppError } from "../utils/AppError.ts";
import type { CreateMusicianDTO } from "../types/musicians.ts";

type MusicianData = Partial<CreateMusicianDTO>;

const MEMBER_REQUIRED = [
  "section",
  "main_instrument",
  "role",
  "salary_per_day",
] as const;
const MEMBER_ONLY = [...MEMBER_REQUIRED, "join_date"] as const;

export const validateMusicianRules = (data: MusicianData): void => {
  if (data.orchestra_member === undefined) return;

  if (data.orchestra_member) {
    // chk_member_fields: all four fields are required for members
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
    // chk_non_member + chk_join_date: those fields must be absent for non-members
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
