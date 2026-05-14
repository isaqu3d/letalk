import { buildApp } from "./app";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (error) {
    app.log.fatal({ err: error }, "Falha ao iniciar o servidor");
    process.exit(1);
  }
}

void bootstrap();
