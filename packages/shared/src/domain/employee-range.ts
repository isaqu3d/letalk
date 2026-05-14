export type EmployeeRange = "1-9" | "10-49" | "50-249" | "250+" | "unknown";

const LARGE_COMPANY_CAPITAL_THRESHOLD = 1_000_000;

export interface EmployeeRangeInput {
  porte: string | null | undefined;
  capitalSocial: number | null | undefined;
}

export function estimateEmployeeRange(input: EmployeeRangeInput): EmployeeRange {
  const porte = (input.porte ?? "").trim().toUpperCase();

  if (porte.includes("MICRO")) {
    return "1-9";
  }

  if (porte.includes("PEQUENO")) {
    return "10-49";
  }

  if (porte === "DEMAIS" || porte === "GRANDE") {
    const capital = input.capitalSocial ?? 0;
    if (capital >= LARGE_COMPANY_CAPITAL_THRESHOLD) {
      return "250+";
    }
    return "50-249";
  }

  return "unknown";
}
