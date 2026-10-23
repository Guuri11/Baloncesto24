import { and, eq, gte, sql } from "drizzle-orm";
import { Effect } from "effect";
import type { RepositorioTienda } from "../aplicacion/comprar-zapatillas.ts";
import { Centimos, IdentificadorZapatilla } from "../dominio/valores.ts";
import type { BaseDatos } from "./base-datos.ts";
import { inventario, lineasPedido, pedidos, zapatillas } from "./esquema.ts";

class StockInsuficiente extends Error {}

const errorPersistencia = (error: unknown) => ({
  tipo: "error-persistencia" as const,
  mensaje: String(error),
});

export function crearRepositorioDrizzle(baseDatos: BaseDatos): RepositorioTienda {
  return {
    buscarZapatilla: (id) =>
      Effect.tryPromise({
        try: async () => {
          const [fila] = await baseDatos
            .select()
            .from(zapatillas)
            .where(eq(zapatillas.id, id))
            .limit(1);

          if (!fila) return null;

          return {
            id: IdentificadorZapatilla(fila.id),
            marca: fila.marca,
            modelo: fila.modelo,
            precio: Centimos(fila.precioCentimos),
          };
        },
        catch: errorPersistencia,
      }),

    guardarCompra: (pedido) =>
      Effect.tryPromise({
        try: () =>
          baseDatos.transaction(async (tx) => {
            for (const linea of pedido.lineas) {
              // Decremento atómico: dos compras concurrentes no pueden vender las mismas unidades.
              const actualizadas = await tx
                .update(inventario)
                .set({ unidades: sql`${inventario.unidades} - ${linea.cantidad}` })
                .where(
                  and(
                    eq(inventario.zapatillaId, linea.zapatillaId),
                    eq(inventario.talla, linea.talla),
                    gte(inventario.unidades, linea.cantidad),
                  ),
                )
                .returning();

              if (actualizadas.length !== 1) throw new StockInsuficiente();
            }

            await tx.insert(pedidos).values({
              id: pedido.id,
              totalCentimos: pedido.total,
              estado: pedido.estado,
            });

            await tx.insert(lineasPedido).values(
              pedido.lineas.map((linea) => ({
                pedidoId: pedido.id,
                zapatillaId: linea.zapatillaId,
                talla: linea.talla,
                precioUnitarioCentimos: linea.precioUnitario,
                cantidad: linea.cantidad,
              })),
            );

            return pedido;
          }),
        catch: (error) =>
          error instanceof StockInsuficiente
            ? { tipo: "stock-insuficiente" as const }
            : errorPersistencia(error),
      }),
  };
}
