export interface Endereco {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
}

export interface Socio {
  nome: string;
  qualificacao: string | null;
}

export interface Company {
  razaoSocial: string;
  nomeFantasia: string | null;
  cnaePrincipal: string | null;
  cnaeDescription: string | null;
  capitalSocial: number | null;
  porte: string | null;
  situacao: string | null;
  dataAbertura: string | null;
  endereco: Endereco;
  socios: Socio[];
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
  company: Company;
}

export interface PaginatedLeads {
  items: Lead[];
  total: number;
}
