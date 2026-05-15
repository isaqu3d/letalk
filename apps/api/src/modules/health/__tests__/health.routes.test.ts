import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type AppInstance, buildApp } from "../../../app";

describe("GET /health", () => {
  let app: AppInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("responde 200 com status ok e timestamp ISO", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { status: string; timestamp: string };
    expect(body.status).toBe("ok");
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow();
  });
});
