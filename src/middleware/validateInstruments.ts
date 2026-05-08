// src/middleware/validateInstruments.ts
import { AppError } from "../utils/AppError.ts";
import type { CreateInstrumentDTO } from "../types/instruments.ts";

export const validateInstrumentRules = (data: Partial<CreateInstrumentDTO>) => {
  //chk_rent_fee: rent_fee_per_day only if owner_type = "Rent"
  if (data.owner_type !== "Rent" && data.rent_fee_per_day != null) {
    throw new AppError(
      "Hyresavgift får endast anges för instrument med owner_type 'Rent'.",
      400,
    );
  }

  // chk_sell_date: sell_date only if owner_type = "Orchestra"
  if (data.owner_type !== "Orchestra" && data.sell_date != null) {
    throw new AppError(
      "Försäljningsdatum får endast anges för instrument som tillhör 'Orchestra'.",
      400,
    );
  }

  // chk_sell_price requires sell_date
  if (data.sell_price != null && data.sell_date == null) {
    throw new AppError("Försäljningpris kräver ett försäljningsdatum.", 400);
  }
};
