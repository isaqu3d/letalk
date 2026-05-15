export interface CompanySnapshot {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnaePrincipal: string | null;
  cnaeDescription: string | null;
  capitalSocial: number | null;
  porte: string | null;
  situacao: string | null;
  dataAbertura: string | null;
  fetchedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  contactRole: string | null;
  segment: string;
  employeeRange: string;
  createdAt: string;
  snapshotId: string | null;
  snapshot: CompanySnapshot | null;
}

export interface PaginatedLeads {
  items: Lead[];
  total: number;
}
