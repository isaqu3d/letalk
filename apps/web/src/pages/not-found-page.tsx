import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

export const NotFoundPage = () => {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-700">
        404
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight text-ink">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink-soft">
        O endereço que você acessou não existe ou foi removido. Volte para
        cadastrar um novo lead ou consultar o histórico.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={ROUTES.home}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700"
        >
          Cadastrar novo lead
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          to={ROUTES.history}
          className="rounded-full border border-surface-border bg-surface px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-soft"
        >
          Ir para o histórico
        </Link>
      </div>
    </main>
  );
};
