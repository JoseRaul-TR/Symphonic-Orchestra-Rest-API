// src/types/musicians.ts
export type Section =
  | "Strings"
  | "Woodwinds"
  | "Brass"
  | "Percussion"
  | "Harp & Piano";

export type MainInstrument =
  | "Violin I"
  | "Violin II"
  | "Viola"
  | "Cello"
  | "Double Bass"
  | "Flute"
  | "Oboe"
  | "Clarinet"
  | "Bassoon"
  | "Horn"
  | "Trumpet"
  | "Trombone"
  | "Tuba"
  | "Timpani"
  | "Percussion"
  | "Harp"
  | "Piano";

export type Role =
  | "1st Concertmaster"
  | "Concertmaster"
  | "1st Principal"
  | "1st Principal of the 2nd Violins"
  | "Principal 2nd Violin"
  | "1st Principal Viola"
  | "1st Principal Cello"
  | "1st Principal Bass"
  | "Principal"
  | "Piccolo"
  | "English Horn"
  | "Bass Clarinet"
  | "Contrabassoon"
  | "Bass Trombone"
  | "Tutti";

export interface Musician {
  id: number;
  name: string;
  surname: string;
  birth_date: string | Date;
  orchestra_member: boolean;
  join_date?: string | Date | null;
  nationality: string;
  section?: Section | null;
  main_instrument?: MainInstrument | null;
  role?: Role | null;
  salary_per_day?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export type CreateMusicianDTO = Omit<
  Musician,
  "id" | "created_at" | "updated_at"
>;

export interface MusicianFilters {
  orchestra_member?: boolean;
  nationality?: string;
  section?: Section;
  main_instrument?: MainInstrument;
  role?: Role;
  sortBy?: string;
  order?: "ASC" | "DESC";
}
