import { conectarBaseDatos } from "./base-datos.ts";
import { inventario, zapatillas } from "./esquema.ts";

const baseDatos = conectarBaseDatos(process.env.DATABASE_URL!);

await baseDatos
  .insert(zapatillas)
  .values([
    { id: "nike-gt-cut-3", marca: "Nike", modelo: "G.T. Cut 3", precioCentimos: 18999 },
    { id: "adidas-ae-1", marca: "Adidas", modelo: "AE 1", precioCentimos: 12000 },
  ])
  .onConflictDoNothing();

await baseDatos
  .insert(inventario)
  .values([
    { zapatillaId: "nike-gt-cut-3", talla: 43, unidades: 5 },
    { zapatillaId: "nike-gt-cut-3", talla: 44, unidades: 1 },
    { zapatillaId: "adidas-ae-1", talla: 42, unidades: 3 },
  ])
  .onConflictDoNothing();

console.log("Semilla cargada");
await baseDatos.$client.end();
