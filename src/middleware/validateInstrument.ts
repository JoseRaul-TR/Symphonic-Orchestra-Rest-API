// src/middleware/validateInstrument.ts
import { AppError } from "../utils/AppError.ts";
import type { CreateInstrumentDTO } from "../types/instruments.ts";

/**
 * Validates instrument data against the three CHECK constraints defined in MySQL.
 * Called before INSERT (create) and after merging current + patch data (update).
 *
 * Rules enforced:
 *   chk_rent_fee   → rent_fee_per_day may only be set when owner_type is "Rent".
 *   chk_sell_date  → sell_date may only be set when owner_type is "Orchestra".
 *   chk_sell_price → sell_price requires a sell_date to be present.
 *
 * Uses loose inequality (!= null) to catch both null and undefined,
 * since optional fields absent from a PATCH body arrive as undefined.
 *
 * @param data - Full or partial instrument payload to validate
 * @throws AppError 400 if any constraint is violated
 */
export const validateInstrumentRules = (
  data: Partial<CreateInstrumentDTO>,
): void => {
  if (data.owner_type !== "Rent" && data.rent_fee_per_day != null) {
    throw new AppError(
      "Hyresavgift får endast anges för instrument med owner_type 'Rent'.",
      400,
    );
  }

  if (data.owner_type !== "Orchestra" && data.sell_date != null) {
    throw new AppError(
      "Försäljningsdatum får endast anges för instrument som tillhör 'Orchestra'.",
      400,
    );
  }

  if (data.sell_price != null && data.sell_date == null) {
    throw new AppError("Försäljningspris kräver ett försäljningsdatum.", 400);
  }
};
