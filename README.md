# Baloncesto24

Prueba de concepto de una API de tienda de zapatillas de baloncesto con **TypeScript + DDD + Clean Architecture**.
Cubre un único caso de uso de principio a fin: comprar una talla concreta, comprobar stock, calcular el importe y guardar el pedido.

| Capa            | Tecnología                                                   | Carpeta               |
| --------------- | ------------------------------------------------------------ | --------------------- |
| Dominio         | TypeScript + `Brand` de Effect + `ReadonlyDeep` de type-fest | `src/dominio`         |
| Aplicación      | Effect + ts-pattern                                          | `src/aplicacion`      |
| Infraestructura | Drizzle ORM + PostgreSQL                                     | `src/infraestructura` |
| HTTP            | Hono sobre Bun                                               | `src/entrada`         |
| Herramientas    | Vite+ (`vp`): Vitest, Oxlint, Oxfmt y comprobación de tipos  | `vite.config.ts`      |

Las dependencias apuntan hacia dentro: `entrada → aplicacion → dominio` e `infraestructura → aplicacion → dominio`.
Solo `src/principal.ts` conoce todas las capas.

## Puesta en marcha

```sh
mise install                # bun y vp (fija también DATABASE_URL)
bun install
bun run base:levantar       # PostgreSQL en Docker
bun run base:migrar         # crea las tablas a partir del esquema de Drizzle
bun run base:semilla        # datos de ejemplo
bun run desarrollo          # http://localhost:3024
```

```sh
curl -X POST localhost:3024/compras -d '{"zapatillaId":"nike-gt-cut-3","talla":43,"cantidad":1}'
```

| Respuesta | Cuándo                                       |
| --------- | -------------------------------------------- |
| 201       | Pedido creado                                |
| 400       | JSON mal formado, talla o cantidad inválidas |
| 404       | La zapatilla no existe                       |
| 409       | No hay stock suficiente de esa talla         |

## Verificación

```sh
vp test          # modo watch para TDD
bun run verificar   # formato + lint + tipos + todos los tests
```

Los tests de integración (`tests/integracion`) usan PostgreSQL real y se omiten si no hay `DATABASE_URL`.

## Decisiones respecto al planteamiento original

- **Dinero en céntimos enteros** (`Centimos`) en lugar de `number` con decimales: elimina los errores de redondeo.
- **Effect 4**: `Effect.either` pasa a ser `Effect.result` (`Success` / `Failure`).
- **El repositorio recibe la conexión** en lugar de importar un singleton: los tests de integración crean la suya.
- **`guardarCompra` recorre todas las líneas** del pedido con un `UPDATE ... WHERE unidades >= cantidad` atómico por línea dentro de una transacción.
- La validación HTTP usa `Schema` de Effect solo para la forma del JSON; las reglas de negocio las aplica el dominio.

## Fuera del alcance de la PoC

Autenticación, migraciones versionadas (`drizzle-kit generate`), control de concurrencia de precios, catálogo y consultas de pedidos.
