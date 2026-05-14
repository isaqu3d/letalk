export type CnaeSegment =
  | "Agronegócio"
  | "Indústria"
  | "Utilities"
  | "Construção"
  | "Comércio"
  | "Logística"
  | "Hospitalidade"
  | "Tecnologia"
  | "Financeiro"
  | "Imobiliário"
  | "Serviços"
  | "Setor Público"
  | "Educação"
  | "Saúde"
  | "Cultura e Lazer"
  | "Outros";

interface DivisionRange {
  readonly from: number;
  readonly to: number;
  readonly segment: CnaeSegment;
}

const DIVISION_RANGES: readonly DivisionRange[] = [
  { from: 1, to: 3, segment: "Agronegócio" },
  { from: 5, to: 33, segment: "Indústria" },
  { from: 35, to: 39, segment: "Utilities" },
  { from: 41, to: 43, segment: "Construção" },
  { from: 45, to: 47, segment: "Comércio" },
  { from: 49, to: 53, segment: "Logística" },
  { from: 55, to: 56, segment: "Hospitalidade" },
  { from: 58, to: 63, segment: "Tecnologia" },
  { from: 64, to: 66, segment: "Financeiro" },
  { from: 68, to: 68, segment: "Imobiliário" },
  { from: 69, to: 82, segment: "Serviços" },
  { from: 84, to: 84, segment: "Setor Público" },
  { from: 85, to: 85, segment: "Educação" },
  { from: 86, to: 88, segment: "Saúde" },
  { from: 90, to: 93, segment: "Cultura e Lazer" },
  { from: 94, to: 97, segment: "Serviços" },
  { from: 99, to: 99, segment: "Outros" },
];

const FALLBACK_SEGMENT: CnaeSegment = "Outros";
const CNAE_DIVISION_LENGTH = 2;
const NON_DIGIT_PATTERN = /\D/g;

function buildDivisionToSegmentMap(): Record<string, CnaeSegment> {
  const map: Record<string, CnaeSegment> = {};
  for (const range of DIVISION_RANGES) {
    for (let division = range.from; division <= range.to; division++) {
      const key = division.toString().padStart(CNAE_DIVISION_LENGTH, "0");
      map[key] = range.segment;
    }
  }
  return map;
}

const DIVISION_TO_SEGMENT = buildDivisionToSegmentMap();

export function extractCnaeDivision(cnaeCode: string): string | null {
  const digits = cnaeCode.replace(NON_DIGIT_PATTERN, "");
  if (digits.length < CNAE_DIVISION_LENGTH) {
    return null;
  }
  return digits.slice(0, CNAE_DIVISION_LENGTH);
}

export function segmentFromCnae(
  cnaeCode: string | null | undefined,
): CnaeSegment {
  if (cnaeCode === null || cnaeCode === undefined) {
    return FALLBACK_SEGMENT;
  }
  const division = extractCnaeDivision(cnaeCode);
  if (division === null) {
    return FALLBACK_SEGMENT;
  }
  return DIVISION_TO_SEGMENT[division] ?? FALLBACK_SEGMENT;
}
