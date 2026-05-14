import { defineConfig } from "vitest/config";

process.env.NODE_ENV ??= "test";
process.env.LOG_LEVEL ??= "silent";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/__tests__/**",
        "src/**/index.ts",
        "src/server.ts",
        "src/config/**",
        "src/infra/db/**",
        "src/infra/logger/**",
        "src/plugins/cors.ts",
        "src/plugins/helmet.ts",
        "src/plugins/rate-limit.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
