import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main/index.ts"),
      fileName: () => "main.js",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["electron", "node:path"],
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
});
