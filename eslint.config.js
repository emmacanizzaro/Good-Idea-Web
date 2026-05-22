import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist/**"],
  },
  js.configs.recommended,
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-console": "warn",
    },
  },
];
