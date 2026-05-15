import { useCreateLead } from "../api/use-create-lead";
import { ErrorAlert } from "../components/error-alert";
import { LeadForm } from "../components/lead-form";
import { LeadResult } from "../components/lead-result";

export function LeadSearchPage() {
  const mutation = useCreateLead();

  const lead = mutation.data;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-700">
          Novo lead
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">
          Cadastre um lead e enriqueça com dados do CNPJ
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Informe os dados do contato e o CNPJ da empresa. Buscamos as
          informações públicas automaticamente e classificamos o lead por
          segmento e porte.
        </p>
      </header>

      {mutation.isError && (
        <div className="mb-6">
          <ErrorAlert error={mutation.error} />
        </div>
      )}

      {lead !== undefined ? (
        <LeadResult lead={lead} onReset={() => mutation.reset()} />
      ) : (
        <LeadForm
          onSubmit={(data) => mutation.mutate(data)}
          isPending={mutation.isPending}
        />
      )}
    </main>
  );
}
