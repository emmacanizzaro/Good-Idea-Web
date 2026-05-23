import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/DevIAR-Web/" : "/",
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
