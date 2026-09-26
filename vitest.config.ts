import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    // Pure-logic unit tests run in plain Node. Files that need a DOM opt in
    // with a `@vitest-environment jsdom` docblock.
    environment: "node",
    setupFiles: ["./src/test-setup.ts"],
    testTimeout: 15_000,
  },
});
