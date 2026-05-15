import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead, PaginatedLeads } from "@/types/lead";
import { LeadHistoryPage } from "../lead-history-page";

function buildLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: `lead-${Math.random().toString(36).slice(2)}`,
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "11987654321",
    cnpj: "33000167000101",
    contactRole: "Diretora",
    segment: "Indústria",
    employeeRange: "250+",
    createdAt: new Date("2026-01-15T10:00:00Z").toISOString(),
    snapshotId: "snap-1",
    snapshot: null,
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function renderPage(): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  render(<LeadHistoryPage />, { wrapper: Wrapper });
}

describe("LeadHistoryPage", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exibe estado vazio quando não há leads", async () => {
    const payload: PaginatedLeads = { items: [], total: 0 };
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(payload));

    renderPage();

    expect(
      await screen.findByText(/nenhum lead cadastrado/i),
    ).toBeInTheDocument();
  });

  it("renderiza tabela com leads vindos da API", async () => {
    const payload: PaginatedLeads = {
      items: [
        buildLead({
          id: "lead-1",
          name: "Maria Silva",
          email: "maria@example.com",
          segment: "Indústria",
        }),
        buildLead({
          id: "lead-2",
          name: "João Souza",
          email: "joao@example.com",
          segment: "Tecnologia",
        }),
      ],
      total: 2,
    };
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(jsonResponse(payload));

    renderPage();

    expect((await screen.findAllByText("Maria Silva")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("João Souza").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Indústria").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tecnologia").length).toBeGreaterThan(0);
  });

  it("mostra paginação somente quando há mais leads que o page size", async () => {
    const manyLeads = Array.from({ length: 21 }, (_value, index) =>
      buildLead({ id: `lead-${index}`, email: `lead${index}@example.com` }),
    );
    vi.mocked(globalThis.fetch).mockResolvedValue(
      jsonResponse({ items: manyLeads.slice(0, 20), total: 21 }),
    );

    renderPage();

    expect(
      await screen.findByRole("button", { name: /próxima/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("dispara nova request com offset quando 'Próxima' é clicada", async () => {
    const firstPage = Array.from({ length: 5 }, (_value, index) =>
      buildLead({ id: `lead-${index}`, email: `lead${index}@example.com` }),
    );
    const secondPage = Array.from({ length: 3 }, (_value, index) =>
      buildLead({
        id: `lead-${index + 5}`,
        email: `lead${index + 5}@example.com`,
      }),
    );

    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ items: firstPage, total: 8 }));
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ items: secondPage, total: 8 }),
    );

    renderPage();

    const user = userEvent.setup();
    const nextButton = await screen.findByRole("button", { name: /próxima/i });
    await user.click(nextButton);

    await waitFor(() => {
      const lastCall = fetchMock.mock.calls.at(-1);
      expect(String(lastCall?.[0])).toContain("offset=5");
    });
  });

  it("exibe mensagem de erro quando API falha", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse({ code: "INTERNAL_ERROR", message: "Falhou" }, 500),
    );

    renderPage();

    expect(
      await screen.findByText(/não foi possível carregar/i),
    ).toBeInTheDocument();
  });
});
