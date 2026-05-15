const DEFAULT_SEGMENT_BADGE = "bg-slate-100 text-slate-800";

const SEGMENT_BADGE_COLORS: Record<string, string> = {
  Agronegócio: "bg-lime-100 text-lime-800",
  Indústria: "bg-orange-100 text-orange-800",
  Utilities: "bg-cyan-100 text-cyan-800",
  Construção: "bg-amber-100 text-amber-800",
  Comércio: "bg-blue-100 text-blue-800",
  Logística: "bg-indigo-100 text-indigo-800",
  Hospitalidade: "bg-pink-100 text-pink-800",
  Tecnologia: "bg-purple-100 text-purple-800",
  Financeiro: "bg-emerald-100 text-emerald-800",
  Imobiliário: "bg-yellow-100 text-yellow-800",
  Serviços: "bg-sky-100 text-sky-800",
  "Setor Público": DEFAULT_SEGMENT_BADGE,
  Educação: "bg-violet-100 text-violet-800",
  Saúde: "bg-rose-100 text-rose-800",
  "Cultura e Lazer": "bg-fuchsia-100 text-fuchsia-800",
  Outros: DEFAULT_SEGMENT_BADGE,
};

export const segmentBadgeClass = (segment: string): string =>
  SEGMENT_BADGE_COLORS[segment] ?? DEFAULT_SEGMENT_BADGE;
