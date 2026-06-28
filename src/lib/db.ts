import { sql } from "@vercel/postgres";

export const db = sql;

export async function query(text: string, params?: unknown[]) {
  return sql.query(text, params);
}
