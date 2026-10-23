import { Effect } from "effect";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  comprarZapatillas,
  type EntradaCompra,
  type RepositorioTienda,
} from "../../src/aplicacion/comprar-zapatillas.ts";
import {
  Centimos,
  IdentificadorPedido,
  IdentificadorZapatilla,
} from "../../src/dominio/valores.ts";

const entrada: EntradaCompra = {
  pedidoId: IdentificadorPedido("pedido-1"),
  zapatillaId: IdentificadorZapatilla("nike-gt-cut-3"),
  talla: 43,
  cantidad: 2,
};

const zapatilla = {
  id: IdentificadorZapatilla("nike-gt-cut-3"),
  marca: "Nike",
  modelo: "G.T. Cut 3",
  precio: Centimos(18_999),
};

// Doble del repositorio: el caso de uso se prueba sin PostgreSQL.
const repositorioFalso = (cambios: Partial<RepositorioTienda> = {}): RepositorioTienda => ({
  buscarZapatilla: () => Effect.succeed(zapatilla),
  guardarCompra: (pedido) => Effect.succeed(pedido),
  ...cambios,
});

const ejecutar = (repositorio: RepositorioTienda, datos: EntradaCompra = entrada) =>
  Effect.runPromise(Effect.result(comprarZapatillas(repositorio, datos)));

describe("comprarZapatillas", () => {
  it("falla si la zapatilla no existe", async () => {
    const guardarCompra = vi.fn();
    const repositorio = repositorioFalso({
      buscarZapatilla: () => Effect.succeed(null),
      guardarCompra,
    });

    expect(await ejecutar(repositorio)).toMatchObject({
      _tag: "Failure",
      failure: { tipo: "zapatilla-no-encontrada" },
    });
    expect(guardarCompra).not.toHaveBeenCalled();
  });

  it("no guarda nada si el dominio rechaza el pedido", async () => {
    const guardarCompra = vi.fn();

    const resultado = await ejecutar(repositorioFalso({ guardarCompra }), {
      ...entrada,
      cantidad: 0,
    });

    expect(resultado).toMatchObject({ failure: { tipo: "cantidad-invalida" } });
    expect(guardarCompra).not.toHaveBeenCalled();
  });

  it("propaga el error de stock del repositorio", async () => {
    const repositorio = repositorioFalso({
      guardarCompra: () => Effect.fail({ tipo: "stock-insuficiente" as const }),
    });

    expect(await ejecutar(repositorio)).toMatchObject({
      failure: { tipo: "stock-insuficiente" },
    });
  });

  it("guarda el pedido con el precio vigente de la zapatilla", async () => {
    const resultado = await ejecutar(repositorioFalso());

    expect(resultado).toMatchObject({
      _tag: "Success",
      success: { total: 37_998, lineas: [{ precioUnitario: 18_999, cantidad: 2 }] },
    });
  });
});
