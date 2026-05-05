// src/types/instrument.ts
export type OwnerType = "Orchestra" | "Musician" | "Rent";

export interface Instrument {
  id: number;
  type: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  purchase_price?: number | null;
  estimated_value?: number | null;
  manufacture_year?: number | null;
  purchase_date?: string | Date | null;
  sell_date?: string | Date | null;
  sell_price?: number | null;
  owner_type: OwnerType;
  owner_id?: number | null; // FK -> musicians.id
  rent_fee_per_day?: number | null;
}

// Combined Interface
export interface InstrumentWithOwner extends Instrument {
  owner_name?: string;
  owner_surname?: string;
}
