import { afterAll, beforeEach, describe, expect, it } from "vite-plus/test";
import { crearApi } from "../../src/entrada/http.ts";
import { conectarBaseDatos } from "../../src/infraestructura/base-datos.ts";
import {
  inventario,
  lineasPedido,
  pedidos,
  zapatillas,
} from "../../src/infraestructura/esquema.ts";
import { crearRepositorioDrizzle } from "../../src/infraestructura/repositorio-drizzle.ts";

const url = process.env.DATABASE_URL;

// Requiere PostgreSQL levantado y migrado (ver README). Sin DATABASE_URL se omite.
describe.skipIf(!url)("POST /compras contra PostgreSQL", () => {
  const baseDatos = conectarBaseDatos(url!);
  const api = crearApi(crearRepositorioDrizzle(baseDatos));

  const comprar = (cuerpo: unknown) =>
    api.request("/compras", { method: "POST", body: JSON.stringify(cuerpo) });

  beforeEach(async () => {
    await baseDatos.delete(lineasPedido);
    await baseDatos.delete(pedidos);
    await baseDatos.delete(inventario);
    await baseDatos.delete(zapatillas);
    await baseDatos
      .insert(zapatillas)
      .values({ id: "nike-gt-cut-3", marca: "Nike", modelo: "G.T. Cut 3", precioCentimos: 18_999 });
    await baseDatos
      .insert(inventario)
      .values({ zapatillaId: "nike-gt-cut-3", talla: 43, unidades: 2 });
  });

  afterAll(() => baseDatos.$client.end());

  it("crea el pedido y descuenta el stock", async () => {
    const respuesta = await comprar({ zapatillaId: "nike-gt-cut-3", talla: 43, cantidad: 2 });

    expect(respuesta.status).toBe(201);
    expect(await respuesta.json()).toMatchObject({ total: 37_998, estado: "confirmado" });
    expect(await baseDatos.select().from(inventario)).toMatchObject([{ unidades: 0 }]);
  });

  it("devuelve 409 y no crea pedido si no hay stock", async () => {
    const respuesta = await comprar({ zapatillaId: "nike-gt-cut-3", talla: 43, cantidad: 3 });

    expect(respuesta.status).toBe(409);
    expect(await baseDatos.select().from(pedidos)).toHaveLength(0);
  });

  it("solo una de dos compras concurrentes se lleva la última unidad", async () => {
    await baseDatos.update(inventario).set({ unidades: 1 });

    const respuestas = await Promise.all([
      comprar({ zapatillaId: "nike-gt-cut-3", talla: 43, cantidad: 1 }),
      comprar({ zapatillaId: "nike-gt-cut-3", talla: 43, cantidad: 1 }),
    ]);

    expect(respuestas.map((r) => r.status).toSorted((a, b) => a - b)).toEqual([201, 409]);
  });

  it("devuelve 400 ante un JSON inválido", async () => {
    const respuesta = await api.request("/compras", { method: "POST", body: "{no-es-json" });

    expect(respuesta.status).toBe(400);
  });
});
