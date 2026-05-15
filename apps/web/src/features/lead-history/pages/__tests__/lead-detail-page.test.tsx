import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "@/types/lead";
import { LeadDetailPage } from "../lead-detail-page";

const SAMPLE_LEAD: Lead = {
  id: "lead-1",
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "11987654321",
  cnpj: "33000167000101",
  contactRole: "Diretora",
  segment: "Indústria",
  employeeRange: "250+",
  createdAt: new Date("2026-01-15T10:00:00Z").toISOString(),
  snapshotId: "snap-1",
  snapshot: {
    id: "snap-1",
    cnpj: "33000167000101",
    razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS",
    nomeFantasia: "PETROBRAS",
    cnaePrincipal: "0600001",
    cnaeDescription: "Extração de petróleo e gás natural",
    capitalSocial: 205431960000,
    porte: "DEMAIS",
    situacao: "ATIVA",
    dataAbertura: "1966-09-28T00:00:00.000Z",
    fetchedAt: new Date().toISOString(),
  },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function renderDetail(id: string): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/leads/${id}`]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  render(
    <Routes>
      <Route path="/leads/:id" element={<LeadDetailPage />} />
    </Routes>,
    { wrapper: Wrapper },
  );
}

describe("LeadDetailPage", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza todos os campos do lead e snapshot", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(SAMPLE_LEAD));

    renderDetail("lead-1");

    expect(
      await screen.findByRole("heading", {
        name: /PETROLEO BRASILEIRO S A PETROBRAS/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Indústria/)).toBeInTheDocument();
    expect(screen.getByText(/33\.000\.167\/0001-01/)).toBeInTheDocument();
    expect(screen.getByText(/250 ou mais funcionários/i)).toBeInTheDocument();
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
  });

  it("exibe alerta de erro quando lead não é encontrado", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ code: "LEAD_NOT_FOUND", message: "Lead não encontrado" }, 404),
    );

    renderDetail("inexistente");

    expect(
      await screen.findByText(/não foi possível carregar este lead/i),
    ).toBeInTheDocument();
  });
});
