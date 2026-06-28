import { z } from "zod";

export function dateString() {
  return z.preprocess((val) => {
    if (val instanceof Date) return val.toISOString();
    return val;
  }, z.string());
}

export function dateStringNullable() {
  return z.preprocess((val) => {
    if (val === null) return null;
    if (val instanceof Date) return val.toISOString();
    return val;
  }, z.string().nullable());
}
