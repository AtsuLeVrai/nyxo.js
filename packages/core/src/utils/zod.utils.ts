import { z } from "zod";
import { BitFieldManager } from "../managers/index.js";

export function parseBitField<T>(): z.ZodType<T> {
  return z.custom<T>((value) => {
    if (value === undefined || value === null) {
      return false;
    }

    try {
      BitFieldManager.resolve(value);
      return true;
    } catch {
      return false;
    }
  });
}
