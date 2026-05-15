export const formatCurrency = (value: number | null): string => {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
};

export const formatDate = (iso: string | null): string => {
  if (iso === null) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
};

export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const PHONE_MOBILE_LENGTH = 11;
const PHONE_LANDLINE_LENGTH = 10;

export const formatPhone = (digits: string): string => {
  if (digits.length === PHONE_MOBILE_LENGTH) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === PHONE_LANDLINE_LENGTH) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits;
};

const EMPLOYEE_RANGE_LABEL: Record<string, string> = {
  "1-9": "1 a 9 funcionários",
  "10-49": "10 a 49 funcionários",
  "50-249": "50 a 249 funcionários",
  "250+": "250 ou mais funcionários",
  unknown: "Faixa não estimada",
};

export const employeeRangeLabel = (range: string): string =>
  EMPLOYEE_RANGE_LABEL[range] ?? range;
