import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const zapatillas = pgTable("zapatillas", {
  id: text("id").primaryKey(),
  marca: text("marca").notNull(),
  modelo: text("modelo").notNull(),
  precioCentimos: integer("precio_centimos").notNull(),
});

export const inventario = pgTable(
  "inventario",
  {
    zapatillaId: text("zapatilla_id")
      .notNull()
      .references(() => zapatillas.id),
    talla: integer("talla").notNull(),
    unidades: integer("unidades").notNull(),
  },
  (tabla) => [primaryKey({ columns: [tabla.zapatillaId, tabla.talla] })],
);

export const pedidos = pgTable("pedidos", {
  id: text("id").primaryKey(),
  totalCentimos: integer("total_centimos").notNull(),
  estado: text("estado").notNull(),
});

export const lineasPedido = pgTable("lineas_pedido", {
  pedidoId: text("pedido_id")
    .notNull()
    .references(() => pedidos.id),
  zapatillaId: text("zapatilla_id")
    .notNull()
    .references(() => zapatillas.id),
  talla: integer("talla").notNull(),
  precioUnitarioCentimos: integer("precio_unitario_centimos").notNull(),
  cantidad: integer("cantidad").notNull(),
});
