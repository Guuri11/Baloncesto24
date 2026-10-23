import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infraestructura/esquema.ts",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
