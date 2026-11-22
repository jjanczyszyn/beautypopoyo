import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Custom domain (beauty.popoyo.co) serves from root. Override via
// VITE_BASE if you need to deploy under the github.io project subpath
// (e.g. VITE_BASE=/popoyo-beauty/).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/",
  test: { exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"] },
  server: { port: 5174, host: true },
});
