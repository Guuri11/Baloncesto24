import type { ReadonlyDeep } from "type-fest";
import { Centimos, type IdentificadorPedido, type IdentificadorZapatilla } from "./valores.ts";

export type LineaPedido = ReadonlyDeep<{
  zapatillaId: IdentificadorZapatilla;
  talla: number;
  precioUnitario: Centimos;
  cantidad: number;
}>;

export type Pedido = ReadonlyDeep<{
  id: IdentificadorPedido;
  lineas: LineaPedido[];
  total: Centimos;
  estado: "confirmado";
}>;

export type ErrorDominio =
  | { tipo: "pedido-vacio" }
  | { tipo: "cantidad-invalida" }
  | { tipo: "talla-invalida" };

const esEnteroPositivo = (valor: number) => Number.isInteger(valor) && valor > 0;

export function crearPedido(
  id: IdentificadorPedido,
  lineas: readonly LineaPedido[],
): Pedido | ErrorDominio {
  if (lineas.length === 0) {
    return { tipo: "pedido-vacio" };
  }

  if (lineas.some((linea) => !esEnteroPositivo(linea.cantidad))) {
    return { tipo: "cantidad-invalida" };
  }

  if (lineas.some((linea) => !esEnteroPositivo(linea.talla))) {
    return { tipo: "talla-invalida" };
  }

  const total = Centimos(
    lineas.reduce((suma, linea) => suma + linea.precioUnitario * linea.cantidad, 0),
  );

  return { id, lineas, total, estado: "confirmado" };
}
