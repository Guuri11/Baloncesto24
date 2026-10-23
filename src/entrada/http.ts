import { Effect, Result, Schema } from "effect";
import { Hono } from "hono";
import { match } from "ts-pattern";
import { comprarZapatillas, type RepositorioTienda } from "../aplicacion/comprar-zapatillas.ts";
import { IdentificadorPedido, IdentificadorZapatilla } from "../dominio/valores.ts";

// Solo valida la forma del JSON; las reglas de negocio (talla, cantidad) las comprueba el dominio.
const decodificarCompra = Schema.decodeUnknownResult(
  Schema.Struct({
    zapatillaId: Schema.NonEmptyString,
    talla: Schema.Number,
    cantidad: Schema.Number,
  }),
);

export function crearApi(repositorio: RepositorioTienda) {
  const api = new Hono();

  api.post("/compras", async (contexto) => {
    const entrada = decodificarCompra(await contexto.req.json().catch(() => null));

    if (Result.isFailure(entrada)) {
      return contexto.json({ error: "Petición inválida" }, 400);
    }

    const resultado = await Effect.runPromise(
      Effect.result(
        comprarZapatillas(repositorio, {
          pedidoId: IdentificadorPedido(crypto.randomUUID()),
          zapatillaId: IdentificadorZapatilla(entrada.success.zapatillaId),
          talla: entrada.success.talla,
          cantidad: entrada.success.cantidad,
        }),
      ),
    );

    if (Result.isSuccess(resultado)) {
      return contexto.json(resultado.success, 201);
    }

    return match(resultado.failure)
      .with({ tipo: "zapatilla-no-encontrada" }, () =>
        contexto.json({ error: "Zapatilla no encontrada" }, 404),
      )
      .with({ tipo: "stock-insuficiente" }, () =>
        contexto.json({ error: "Stock insuficiente" }, 409),
      )
      .with({ tipo: "pedido-vacio" }, () => contexto.json({ error: "El pedido está vacío" }, 400))
      .with({ tipo: "cantidad-invalida" }, () => contexto.json({ error: "Cantidad inválida" }, 400))
      .with({ tipo: "talla-invalida" }, () => contexto.json({ error: "Talla inválida" }, 400))
      .with({ tipo: "error-persistencia" }, (error) => {
        console.error(error.mensaje);
        return contexto.json({ error: "Error interno" }, 500);
      })
      .exhaustive();
  });

  return api;
}
