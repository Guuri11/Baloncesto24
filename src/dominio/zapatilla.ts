import type { ReadonlyDeep } from "type-fest";
import type { Centimos, IdentificadorZapatilla } from "./valores.ts";

export type Zapatilla = ReadonlyDeep<{
  id: IdentificadorZapatilla;
  marca: string;
  modelo: string;
  precio: Centimos;
}>;
