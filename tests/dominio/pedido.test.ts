import { describe, expect, it } from "vite-plus/test";
import { crearPedido, type LineaPedido } from "../../src/dominio/pedido.ts";
import {
  Centimos,
  IdentificadorPedido,
  IdentificadorZapatilla,
} from "../../src/dominio/valores.ts";

const linea = (cambios: Partial<LineaPedido> = {}): LineaPedido => ({
  zapatillaId: IdentificadorZapatilla("nike-gt-cut-3"),
  talla: 43,
  precioUnitario: Centimos(10_000),
  cantidad: 1,
  ...cambios,
});

describe("crearPedido", () => {
  const id = IdentificadorPedido("pedido-1");

  it("rechaza un pedido vacío", () => {
    expect(crearPedido(id, [])).toEqual({ tipo: "pedido-vacio" });
  });

  it.each([0, -1, 1.5])("rechaza la cantidad %s", (cantidad) => {
    expect(crearPedido(id, [linea({ cantidad })])).toEqual({ tipo: "cantidad-invalida" });
  });

  it("rechaza una talla no positiva", () => {
    expect(crearPedido(id, [linea({ talla: 0 })])).toEqual({ tipo: "talla-invalida" });
  });

  it("calcula el total sumando todas las líneas", () => {
    const resultado = crearPedido(id, [
      linea({ precioUnitario: Centimos(18_999), cantidad: 2 }),
      linea({ precioUnitario: Centimos(12_000), cantidad: 1 }),
    ]);

    expect(resultado).toMatchObject({ estado: "confirmado", total: 49_998 });
  });
});

describe("Centimos", () => {
  it("rechaza importes con decimales o negativos", () => {
    expect(() => Centimos(10.5)).toThrow();
    expect(() => Centimos(-1)).toThrow();
  });
});
