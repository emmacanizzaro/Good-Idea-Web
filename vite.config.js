import { defineConfig } from "vite";

export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" && !isPreview ? "/DevIAR-Web/" : "/",
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
