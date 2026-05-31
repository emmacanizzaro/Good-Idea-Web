
import { defineConfig } from "vite";
import htmlInclude from "vite-plugin-html-include";

export default defineConfig(({ command }) => {
  return {
    base: command === "build" ? "/DevIAR-Web/" : "/",
    plugins: [htmlInclude()],
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
