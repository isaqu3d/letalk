import type { LoggerOptions } from "pino";

export interface LoggerSettings {
  level: string;
  pretty: boolean;
}

export function buildLoggerOptions(settings: LoggerSettings): LoggerOptions {
  const config: LoggerOptions = { level: settings.level };

  if (settings.pretty) {
    config.transport = {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    };
  }

  return config;
}
