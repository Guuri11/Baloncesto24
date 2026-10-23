import { Brand } from "effect";

// Dinero en céntimos enteros: evita los errores de redondeo de los decimales en coma flotante.
export type Centimos = number & Brand.Brand<"Centimos">;
export const Centimos = Brand.make<Centimos>(
  (cantidad) =>
    (Number.isSafeInteger(cantidad) && cantidad >= 0) ||
    "El importe debe ser un número entero de céntimos no negativo",
);

export type IdentificadorZapatilla = string & Brand.Brand<"IdentificadorZapatilla">;
export const IdentificadorZapatilla = Brand.nominal<IdentificadorZapatilla>();

export type IdentificadorPedido = string & Brand.Brand<"IdentificadorPedido">;
export const IdentificadorPedido = Brand.nominal<IdentificadorPedido>();
