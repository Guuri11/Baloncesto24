import { Effect } from "effect";
import { match, P } from "ts-pattern";
import { crearPedido, type ErrorDominio, type Pedido } from "../dominio/pedido.ts";
import type { Zapatilla } from "../dominio/zapatilla.ts";
import type { IdentificadorPedido, IdentificadorZapatilla } from "../dominio/valores.ts";

export type ErrorPersistencia = { tipo: "error-persistencia"; mensaje: string };

export type ErrorCompra =
  | ErrorDominio
  | ErrorPersistencia
  | { tipo: "zapatilla-no-encontrada" }
  | { tipo: "stock-insuficiente" };

// Contrato que necesita el caso de uso; la infraestructura lo implementa.
export interface RepositorioTienda {
  buscarZapatilla(id: IdentificadorZapatilla): Effect.Effect<Zapatilla | null, ErrorPersistencia>;
  guardarCompra(
    pedido: Pedido,
  ): Effect.Effect<Pedido, ErrorPersistencia | { tipo: "stock-insuficiente" }>;
}

export type EntradaCompra = {
  pedidoId: IdentificadorPedido;
  zapatillaId: IdentificadorZapatilla;
  talla: number;
  cantidad: number;
};

export function comprarZapatillas(
  repositorio: RepositorioTienda,
  entrada: EntradaCompra,
): Effect.Effect<Pedido, ErrorCompra> {
  return Effect.gen(function* () {
    const zapatilla = yield* repositorio.buscarZapatilla(entrada.zapatillaId);

    if (zapatilla === null) {
      return yield* Effect.fail({ tipo: "zapatilla-no-encontrada" as const });
    }

    const resultado = crearPedido(entrada.pedidoId, [
      {
        zapatillaId: zapatilla.id,
        talla: entrada.talla,
        precioUnitario: zapatilla.precio,
        cantidad: entrada.cantidad,
      },
    ]);

    const pedido = yield* match(resultado)
      .with({ tipo: P.string }, (error) => Effect.fail(error))
      .with({ estado: "confirmado" }, (pedido) => Effect.succeed(pedido))
      .exhaustive();

    return yield* repositorio.guardarCompra(pedido);
  });
}
