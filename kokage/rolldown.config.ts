import { defineConfig } from "rolldown";

export default defineConfig({
  tsconfig: "tsconfig.json",
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
  },
});
