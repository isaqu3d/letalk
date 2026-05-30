import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateLeadInput, createLeadInputSchema } from "@letalk/shared";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Controller, type Control, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { Spinner } from "@/components/spinner";

type LeadFormInput = Omit<CreateLeadInput, "role"> & { role?: unknown };
type LeadFormControl = Control<LeadFormInput, unknown, CreateLeadInput>;

interface LeadFormProps {
  onSubmit: (data: CreateLeadInput) => void;
  isPending: boolean;
}

const inputClassName =
  "w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-placeholder focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-surface-soft";

const phoneMask = "(00) 0000[0]-0000";

const cnpjMask = "00.000.000/0000-00";

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
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

interface FieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  error?: string;
  hint?: string;
  id: string;
}

function Field({ label, error, hint, id, ...inputProps }: FieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input id={id} {...inputProps} className={inputClassName} />
    </FieldShell>
  );
}

interface MaskedFieldProps {
  id: "phone" | "cnpj";
  label: string;
  mask: string;
  placeholder: string;
  hint?: string;
  error?: string;
  control: LeadFormControl;
}

function MaskedField({
  id,
  label,
  mask,
  placeholder,
  hint,
  error,
  control,
}: MaskedFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <Controller
        name={id}
        control={control}
        render={({ field }) => (
          <IMaskInput
            id={id}
            mask={mask}
            value={field.value ?? ""}
            unmask={false}
            onAccept={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            placeholder={placeholder}
            className={inputClassName}
          />
        )}
      />
    </FieldShell>
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormInput, unknown, CreateLeadInput>({
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
          <MaskedField
            id="phone"
            label="Telefone"
            mask={phoneMask}
            placeholder="(11) 91234-5678"
            hint="DDD + número, fixo ou celular"
            error={errors.phone?.message}
            control={control}
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
        <MaskedField
          id="cnpj"
          label="CNPJ"
          mask={cnpjMask}
          placeholder="00.000.000/0000-00"
          error={errors.cnpj?.message}
          control={control}
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
