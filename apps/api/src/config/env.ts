import "dotenv/config";
import { z } from "zod";

const LOG_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
] as const;

const NODE_ENVS = ["development", "test", "production"] as const;

const DEFAULT_PORT = 3333;
const DEFAULT_CORS_ORIGIN = "http://localhost:5173";

const envSchema = z
  .object({
    NODE_ENV: z.enum(NODE_ENVS).default("development"),
    PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
    LOG_LEVEL: z.enum(LOG_LEVELS).optional(),
    CORS_ORIGIN: z.string().url().default(DEFAULT_CORS_ORIGIN),
  })
  .transform((parsed) => ({
    ...parsed,
    LOG_LEVEL:
      parsed.LOG_LEVEL ?? (parsed.NODE_ENV === "test" ? "silent" : "info"),
  }));

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Configuração de ambiente inválida:\n${details}`);
  }
  return result.data;
}

export const env = parseEnv();
