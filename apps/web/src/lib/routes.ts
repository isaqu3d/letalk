export const ROUTES = {
  home: "/",
  history: "/leads",
  detail: (id: string) => `/leads/${id}`,
} as const;

export const ROUTE_PATTERNS = {
  home: "/",
  history: "/leads",
  detail: "/leads/:id",
} as const;
