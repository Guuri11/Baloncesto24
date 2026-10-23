# Reglas para agentes de IA

- El dominio (`src/dominio`) no importa Effect, Drizzle, Hono ni infraestructura; solo `Brand` de Effect para los tipos nominales.
- Los objetos de dominio usan `ReadonlyDeep` y se construyen mediante funciones que validan invariantes.
- Los errores de negocio son uniones discriminadas por `tipo`; se tratan de forma exhaustiva con `ts-pattern` (`.exhaustive()`).
- Los casos de uso dependen de interfaces (`RepositorioTienda`), nunca de implementaciones de Drizzle.
- Los tests del dominio no usan dobles ni infraestructura.
- Cada cambio incluye primero un test del comportamiento esperado.
- No se añaden interfaces, fábricas ni capas sin una necesidad concreta.
- Antes de terminar: `bun run verificar` (formato, lint, tipos y tests) debe pasar.
- Código, nombres y comentarios en castellano.
