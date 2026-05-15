import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateLeadInput, createLeadInputSchema } from "@letalk/shared";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Spinner } from "@/components/spinner";

interface LeadFormProps {
  onSubmit: (data: CreateLeadInput) => void;
  isPending: boolean;
}

interface FieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

function Field({ label, error, hint, id, ...inputProps }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-placeholder focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-surface-soft"
      />
      {hint !== undefined && error === undefined && (
        <span className="text-xs text-ink-soft">{hint}</span>
      )}
      {error !== undefined && (
        <span className="text-xs font-medium text-rose-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function Card({ title, description, children }: CardProps) {
  return (
    <section className="rounded-xl border border-surface-border bg-surface p-6 shadow-sm">
      <header className="mb-5">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        {description !== undefined && (
          <p className="mt-1 text-sm text-ink-soft">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}

export function LeadForm({ onSubmit, isPending }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createLeadInputSchema),
    defaultValues: { name: "", email: "", phone: "", cnpj: "", role: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="flex flex-col gap-6"
      noValidate
    >
      <Card
        title="Dados do contato"
        description="Identificação básica do lead que você está cadastrando."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            id="name"
            label="Nome completo"
            placeholder="Maria Silva"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
          <Field
            id="email"
            label="E-mail"
            type="email"
            placeholder="maria@empresa.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Field
            id="phone"
            label="Telefone"
            placeholder="(11) 91234-5678"
            autoComplete="tel"
            hint="10 ou 11 dígitos, com ou sem máscara"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Field
            id="role"
            label="Cargo (opcional)"
            placeholder="Diretor(a) Comercial"
            error={errors.role?.message}
            {...register("role")}
          />
        </div>
      </Card>

      <Card
        title="Empresa"
        description="Informe o CNPJ para buscarmos os dados públicos da empresa na BrasilAPI."
      >
        <Field
          id="cnpj"
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          hint="Aceitamos com ou sem máscara"
          error={errors.cnpj?.message}
          {...register("cnpj")}
        />
      </Card>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Spinner label="Buscando dados da empresa" />}
          {isPending ? "Buscando dados..." : "Salvar lead"}
        </button>
      </div>
    </form>
  );
}
