import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "@/types/lead";
import { LeadSearchPage } from "../lead-search-page";

const VALID_CNPJ = "33000167000101";

const SAMPLE_LEAD: Lead = {
  id: "lead-1",
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "11987654321",
  cnpj: VALID_CNPJ,
  contactRole: "Diretora Comercial",
  segment: "Indústria",
  employeeRange: "250+",
  createdAt: new Date().toISOString(),
  company: {
    razaoSocial: "PETROLEO BRASILEIRO S A PETROBRAS",
    nomeFantasia: "PETROBRAS",
    cnaePrincipal: "0600001",
    cnaeDescription: "Extração de petróleo e gás natural",
    capitalSocial: 205431960000,
    porte: "DEMAIS",
    situacao: "ATIVA",
    dataAbertura: "1966-09-28T00:00:00.000Z",
    endereco: {
      logradouro: "REPUBLICA DO CHILE",
      numero: "65",
      complemento: null,
      bairro: "CENTRO",
      municipio: "RIO DE JANEIRO",
      uf: "RJ",
      cep: "20031170",
    },
    socios: [{ nome: "JOAO DA SILVA", qualificacao: "Diretor" }],
  },
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function renderPage(): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  render(<LeadSearchPage />, { wrapper: Wrapper });
}

async function fillValidForm(): Promise<void> {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/nome completo/i), "Maria Silva");
  await user.type(screen.getByLabelText(/e-mail/i), "maria@example.com");
  await user.type(screen.getByLabelText(/telefone/i), "(11) 98765-4321");
  await user.type(screen.getByLabelText(/cnpj/i), "33.000.167/0001-01");
  await user.type(screen.getByLabelText(/cargo/i), "Diretora Comercial");
  await user.click(screen.getByRole("button", { name: /salvar lead/i }));
}

describe("LeadSearchPage", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza o formulário inicialmente", () => {
    renderPage();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /salvar lead/i }),
    ).toBeInTheDocument();
  });

  it("exibe erros inline quando campos são inválidos", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/e-mail/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /salvar lead/i }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("ao enviar com sucesso, mostra os dados enriquecidos da empresa", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse(SAMPLE_LEAD, 201),
    );
    renderPage();

    await fillValidForm();

    await waitFor(() => {
      expect(
        screen.getByText(/PETROLEO BRASILEIRO S A PETROBRAS/i),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/Indústria/)).toBeInTheDocument();
    expect(screen.getByText(/250 ou mais funcionários/i)).toBeInTheDocument();
    expect(screen.getByText(/33\.000\.167\/0001-01/)).toBeInTheDocument();
  });

  it("exibe mensagem amigável quando API retorna DUPLICATE_LEAD", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse(
        { code: "DUPLICATE_LEAD", message: "Lead duplicado" },
        409,
      ),
    );
    renderPage();

    await fillValidForm();

    await waitFor(() => {
      expect(
        screen.getByText(/contato já está cadastrado/i),
      ).toBeInTheDocument();
    });
  });

  it("exibe mensagem amigável quando API retorna CNPJ_NOT_FOUND", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      jsonResponse(
        { code: "CNPJ_NOT_FOUND", message: "Não encontrado" },
        404,
      ),
    );
    renderPage();

    await fillValidForm();

    await waitFor(() => {
      expect(
        screen.getByText(/cnpj não encontrado na receita federal/i),
      ).toBeInTheDocument();
    });
  });
});
