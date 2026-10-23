import { crearApi } from "./entrada/http.ts";
import { conectarBaseDatos } from "./infraestructura/base-datos.ts";
import { crearRepositorioDrizzle } from "./infraestructura/repositorio-drizzle.ts";

// Raíz de composición: el único sitio donde se conectan las capas.
const baseDatos = conectarBaseDatos(process.env.DATABASE_URL!);
const api = crearApi(crearRepositorioDrizzle(baseDatos));

export default { port: 3024, fetch: api.fetch };
