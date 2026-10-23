import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as esquema from "./esquema.ts";

export function conectarBaseDatos(url: string) {
  return drizzle(postgres(url), { schema: esquema });
}

export type BaseDatos = ReturnType<typeof conectarBaseDatos>;
