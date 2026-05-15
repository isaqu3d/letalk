import type { ApiError } from "@/lib/api";

interface ErrorAlertProps {
  error: ApiError;
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  INVALID_CNPJ: "CNPJ inválido. Confira os dígitos e tente novamente.",
  CNPJ_NOT_FOUND: "CNPJ não encontrado na Receita Federal (BrasilAPI).",
  BRASIL_API_UNAVAILABLE:
    "Serviço de consulta de CNPJ está indisponível no momento. Tente novamente em alguns instantes.",
  DUPLICATE_LEAD:
    "Esse contato já está cadastrado para esta empresa. Verifique o histórico.",
  VALIDATION_ERROR: "Confira os campos do formulário.",
};

function friendlyMessage(error: ApiError): string {
  return FRIENDLY_MESSAGES[error.code] ?? error.message;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-900"
    >
      <p className="text-sm font-medium">{friendlyMessage(error)}</p>
      {error.issues.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-rose-800">
          {error.issues.map((issue) => (
            <li key={`${issue.path}:${issue.message}`}>
              <strong>{issue.path}:</strong> {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
