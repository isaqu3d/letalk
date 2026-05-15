# Letalk — Enriquecimento de Leads

Cadastro de leads com enriquecimento automático de dados públicos de empresa via BrasilAPI 🧠

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.x-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🚀 Sobre

Aplicação fullstack desenvolvida como **teste técnico para a Letalk**. O usuário cadastra um lead informando dados de contato (nome, e-mail, telefone, cargo opcional) e o CNPJ da empresa. A API consulta a **BrasilAPI**, classifica o lead automaticamente por **segmento de mercado** (16 categorias derivadas do CNAE) e **faixa estimada de funcionários** (porte + capital social), persiste tudo e devolve um snapshot completo da empresa pronto pra exibir no histórico.

Interface **responsiva ponta-a-ponta** (mobile + desktop), com loading states (spinner + skeleton), tratamento de erros padronizado e identidade visual alinhada à marca Letalk.

---

## 🛠 Tecnologias

| Categoria     | Tecnologia                         | Por quê                                                                 |
| ------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| **Monorepo**  | pnpm workspaces + Turborepo        | Compartilhar schemas Zod entre back e front (single source of truth)    |
| **Backend**   | Fastify 5 + Prisma 6 + Postgres 16 | HTTP performático, ORM tipado, banco relacional para integridade        |
| **Validação** | Zod 4                              | Schemas únicos consumidos por API, front e tipos TS                     |
| **Logs**      | Pino                               | Logger estruturado, padrão Fastify                                      |
| **Frontend**  | React 19 + Vite + TanStack Query   | SPA reativa, cache server-state automático                              |
| **Forms**     | react-hook-form + zodResolver      | Validação client-side compartilhada com o backend                       |
| **Estilo**    | Tailwind 4 + lucide-react          | Design tokens da Letalk (paleta `#6B62D1`, fonte Manrope, pill buttons) |
| **Testes**    | Vitest 4 + Testing Library         | Unit, integration e RTL — 150 testes                                    |
| **Docs API**  | Swagger (OpenAPI 3) + Scalar       | Doc interativa em `/docs` gerada dos schemas Zod                        |
| **Container** | Docker Compose                     | Postgres local com volume persistente                                   |

---

## 📁 Estrutura do projeto

```
letalk/
├── apps/
│   ├── api/                              # Backend Fastify
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── app.ts                    # buildApp() — registro de plugins e rotas
│   │       ├── server.ts                 # bootstrap (env + listen)
│   │       ├── config/env.ts             # validação de env vars com Zod
│   │       ├── infra/http/
│   │       │   └── brasil-api.client.ts  # cliente HTTP da BrasilAPI
│   │       ├── modules/
│   │       │   ├── cnpj/
│   │       │   │   ├── cnpj.controller.ts
│   │       │   │   ├── cnpj.service.ts
│   │       │   │   ├── cnpj.repository.ts
│   │       │   │   ├── cnpj.routes.ts
│   │       │   │   ├── cnpj.errors.ts
│   │       │   │   └── cnpj.mapper.ts
│   │       │   ├── leads/
│   │       │   │   ├── leads.controller.ts
│   │       │   │   ├── leads.service.ts
│   │       │   │   ├── leads.repository.ts
│   │       │   │   ├── leads.routes.ts
│   │       │   │   └── leads.errors.ts
│   │       │   └── health/
│   │       ├── plugins/
│   │       │   ├── cors.ts
│   │       │   ├── helmet.ts
│   │       │   ├── rate-limit.ts
│   │       │   └── error-handler.ts      # mapeia DomainError → resposta HTTP
│   │       ├── errors/base.error.ts      # DomainError abstract
│   │       └── shared/http-status.ts     # constantes HTTP centralizadas
│   │
│   └── web/                              # Frontend Vite + React
│       ├── public/                       # favicons + logos oficiais Letalk
│       └── src/
│           ├── App.tsx                   # rotas (BrowserRouter)
│           ├── components/
│           │   ├── site-header.tsx
│           │   └── info-row.tsx
│           ├── features/
│           │   ├── lead-search/          # formulário de cadastro
│           │   │   ├── pages/
│           │   │   ├── components/
│           │   │   └── api/
│           │   └── lead-history/         # listagem + detalhe
│           │       ├── pages/
│           │       ├── components/
│           │       └── api/
│           ├── pages/not-found-page.tsx
│           └── lib/
│               ├── api.ts                # apiRequest + ApiError
│               ├── formatters.ts         # CNPJ, telefone, moeda, data
│               ├── routes.ts             # ROUTES constants
│               └── segment-badge.ts      # classes Tailwind por segmento
│
├── packages/
│   └── shared/                           # Compartilhado entre back e front
│       └── src/
│           ├── schemas/                  # Zod (lead, cnpj, contact)
│           ├── validation/cnpj.ts        # algoritmo dígitos verificadores
│           └── domain/
│               ├── cnae-segments.ts      # mapa CNAE → segmento (16 categorias)
│               └── employee-range.ts     # heurística faixa de funcionários
│
├── docker-compose.yml                    # Postgres 16
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json                    # strict + noUncheckedIndexedAccess
└── Claude.MD                             # regras do projeto (Clean Code + SOLID)
```

### Fluxo de uma requisição

```
[Browser] → React Form → POST /leads (Fastify)
                              ↓
                    Controller (valida Zod)
                              ↓
                    LeadsService.createLead()
                              ↓
                    CnpjService.getCompanyDataWithSnapshot()
                              ↓
                    Cache TTL 24h?  ┌─── HIT  → snapshot do DB
                                    └─── MISS → BrasilAPI → mapper → upsert snapshot
                              ↓
                    LeadsRepository.create() (Prisma)
                              ↓
                    ← LeadWithSnapshot (lead + snapshot)
```

---

## 🗄️ Modelo de dados

```
┌──────────────────────────────┐
│     CompanySnapshot          │
├──────────────────────────────┤
│ id (PK)                      │
│ cnpj (UNIQUE)                │
│ rawData (JSON)               │
│ razaoSocial                  │
│ nomeFantasia?                │
│ cnaePrincipal?               │
│ cnaeDescription?             │
│ capitalSocial?               │
│ porte?                       │
│ situacao?                    │
│ dataAbertura?                │
│ fetchedAt (TTL de 24h)       │
└──────────────┬───────────────┘
               │ 1:N
               ▼
┌──────────────────────────────┐
│            Lead              │
├──────────────────────────────┤
│ id (PK)                      │
│ name                         │
│ email                        │
│ phone                        │
│ cnpj                         │
│ contactRole?                 │
│ segment                      │
│ employeeRange                │
│ snapshotId (FK → Snapshot)   │
│ createdAt                    │
│                              │
│ UNIQUE (email, cnpj)         │
│ INDEX (cnpj)                 │
│ INDEX (createdAt)            │
└──────────────────────────────┘
```

---

## ⚙️ Como rodar

### Pré-requisitos

- Node.js 20+
- pnpm 10+
- Docker (para o Postgres)

### 1. Clone e instale

```sh
git clone git@github.com:isaqu3d/letalk.git
cd letalk
pnpm install
```

### 2. Suba o Postgres

```sh
docker compose up -d
```

### 3. Backend (`apps/api`)

#### Variáveis de ambiente

```sh
cd apps/api
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3333
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://letalk:letalk@localhost:5432/letalk
BRASIL_API_BASE_URL=https://brasilapi.com.br/api
CNPJ_CACHE_TTL_HOURS=24
```

#### Migrations + Prisma Client

```sh
pnpm run db:migrate
pnpm run db:generate
```

#### Servidor de desenvolvimento

```sh
pnpm run dev
```

API em `http://localhost:3333` — documentação interativa em [`http://localhost:3333/docs`](#-documentação-da-api).

### 4. Frontend (`apps/web`)

Em outra aba do terminal:

#### Variáveis de ambiente

```sh
cd apps/web
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:3333
```

#### Servidor de desenvolvimento

```sh
pnpm run dev
```

App em `http://localhost:5173`.

### Atalhos da raiz (opcional)

Se preferir rodar tudo da raiz do monorepo (sem `cd`), o `package.json` raiz delega os comandos mais comuns:

```sh
pnpm dev            # sobe api + web em paralelo (Turborepo)
pnpm dev:api        # só backend
pnpm dev:web        # só frontend
pnpm db:migrate     # migrations do api
pnpm db:generate    # gera Prisma client
pnpm db:studio      # abre Prisma Studio
pnpm db:reset       # reseta o banco (force)
pnpm test           # roda todos os workspaces
pnpm lint           # typecheck em todos
pnpm build          # build de todos
```

> ℹ️ Sempre use os scripts `db:*` (rodando no `apps/api` ou via atalho da raiz). Rodar `npx prisma` solto puxa Prisma 7 da internet e quebra — este projeto está fixado em v6 (ver [Decisões](#-decisões-de-projeto-e-justificativas)).

---

## 📖 Documentação interativa da API

Com o backend rodando, a documentação completa fica em:

```
http://localhost:3333/docs
```

A spec OpenAPI 3.0.3 é **gerada automaticamente** a partir dos schemas Zod de cada rota (`fastify-type-provider-zod`). A UI usa [Scalar](https://scalar.com) com tema purple, mostrando:

- Endpoints agrupados por tag (`Health`, `CNPJ`, `Leads`)
- Schemas de request/response gerados dos Zod schemas
- Códigos de erro possíveis em cada endpoint com descrição
- Exemplos de uso em **Shell, Node.js, Ruby, PHP, Python** e mais
- Botão **Download OpenAPI Document** para importar em Postman/Insomnia

---

## 📡 Endpoints da API

> Base URL: `http://localhost:3333`

| Método | Rota          | Descrição                                          |
| ------ | ------------- | -------------------------------------------------- |
| `GET`  | `/health`     | Status e timestamp                                 |
| `GET`  | `/cnpj/:cnpj` | Consulta direta de CNPJ (usa cache de 24h)         |
| `POST` | `/leads`      | Cria lead + enriquece (retorna `LeadWithSnapshot`) |
| `GET`  | `/leads`      | Lista paginada — query `?limit=5&offset=0`         |
| `GET`  | `/leads/:id`  | Detalhe completo (lead + snapshot)                 |

### Formato de erro padronizado

Todo erro de domínio responde com a mesma estrutura, mapeada pelo handler global:

```json
{
  "code": "INVALID_CNPJ",
  "message": "CNPJ inválido: 11.111.111/1111-11",
  "statusCode": 400,
  "issues": []
}
```

Códigos suportados:

| `code`                   | HTTP | Origem                                   |
| ------------------------ | ---- | ---------------------------------------- |
| `VALIDATION_ERROR`       | 400  | Zod falhou no payload                    |
| `INVALID_CNPJ`           | 400  | Dígitos verificadores não batem          |
| `CNPJ_NOT_FOUND`         | 404  | BrasilAPI retornou 404                   |
| `BRASIL_API_UNAVAILABLE` | 502  | BrasilAPI fora ou erro 5xx               |
| `DUPLICATE_LEAD`         | 409  | Lead com mesmo `(email, cnpj)` já existe |
| `LEAD_NOT_FOUND`         | 404  | `GET /leads/:id` com id inexistente      |

### Exemplo de uso

```sh
# Cadastrar lead
curl -X POST http://localhost:3333/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@petrobras.com.br",
    "phone": "11987654321",
    "role": "Diretora Comercial",
    "cnpj": "33000167000101"
  }'

# Listar leads (5 por página)
curl 'http://localhost:3333/leads?limit=5&offset=0'

# Detalhe
curl http://localhost:3333/leads/cmp78tpu9002wklvvd8wv8m5i
```

---

## 🧪 Testes

São **150 testes** distribuídos em três workspaces, focados em comportamento de negócio (sem testar framework):

| Workspace        | Testes | Cobre                                                                                                                                                 |
| ---------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@letalk/shared` | 88     | Validação CNPJ (dígitos verificadores), schemas Zod, mapa CNAE → segmento, heurística de faixa                                                        |
| `@letalk/api`    | 50     | Integration tests de `/cnpj` e `/leads` com DB real, cliente BrasilAPI (User-Agent, 4xx/5xx), mapper, services (cache TTL, duplicata) e error-handler |
| `@letalk/web`    | 12     | Form de cadastro, listagem paginada e detalhe (Testing Library)                                                                                       |

```sh
# Da raiz: roda tudo (turbo)
pnpm test

# Dentro de um workspace específico
cd apps/api && pnpm run test
cd apps/web && pnpm run test
cd packages/shared && pnpm run test

# Watch e coverage (dentro do workspace)
cd apps/api && pnpm run test:watch
cd apps/api && pnpm run test:coverage
```

> ⚠️ Os testes do `@letalk/api` truncam as tabelas `Lead` e `CompanySnapshot` no setup (integration real contra Postgres). Não rode contra um banco que você não queira limpar.

---

## 🎯 Decisões de projeto e justificativas

### Monorepo com pacote `shared`

Schemas Zod, validação de CNPJ e mapa CNAE vivem em `packages/shared` e são consumidos por **api** e **web**. Isso garante que regra de validação não duplique entre front e back — se o e-mail é inválido pra um, é pra outro. Tipos TS são inferidos via `z.infer`.

### Unique composto `(email, cnpj)` no Lead + 409 `DUPLICATE_LEAD`

Decisão de produto: a **mesma pessoa pode ser lead para empresas diferentes** (vendedor B2B muda de empresa), e a **mesma empresa pode ter contatos diferentes** (vendedor + diretor). Só duplicata exata bloqueia. O service captura `P2002` do Prisma e mapeia pra erro de domínio.

### `CompanySnapshot` separado com TTL de 24h

Evita martelar a BrasilAPI. Toda consulta de CNPJ verifica primeiro o cache; se `fetchedAt` tem menos de 24h, retorna o snapshot persistido. Isso também garante que o histórico de leads exiba dados **congelados no momento do cadastro** (auditoria).

### `POST /leads` retorna `LeadWithSnapshot`

O front consome o resultado direto pra exibir os dados enriquecidos na tela de sucesso, sem precisar de uma segunda chamada. Reduz round-trip e melhora UX.

### BrasilAPI exige `User-Agent`

O `fetch` nativo do Node sem header `User-Agent` retorna 403. O cliente `brasil-api.client.ts` envia `User-Agent: letalk-cnpj-enricher/1.0` e `Accept: application/json` em toda request.

### CNAE com zero à esquerda

A BrasilAPI devolve `cnae_fiscal` como **número** (ex: `600001` em vez de `0600001`). O mapper aplica `.padStart(7, "0")` antes de extrair a divisão usada na segmentação.

### Cargo opcional via `z.preprocess`

O `react-hook-form` envia `""` (string vazia) pra campos não preenchidos, mas `contactRoleSchema.optional()` só aceita `undefined`. Resolvido com `z.preprocess` que converte string vazia ou só-espaços em `undefined` — vale para front e back.

### Responsividade ponta-a-ponta (mobile + desktop)

Tudo foi projetado mobile-first e testado nos dois extremos (375px / 1280px):

- **Header**: logo + subtítulo "Enriquecimento de leads" em desktop; só logo em telas `<sm` (640px) pra dar espaço pro nav.
- **Formulário**: grid 2 colunas em `md`, 1 coluna em mobile (`grid-cols-1 md:grid-cols-2`).
- **Histórico**: em `<md` a tabela é **substituída por uma lista de cards verticais clicáveis** (`md:hidden` + `hidden md:block`). Cada card mantém todas as infos (nome, email, badge de segmento, razão social, CNPJ, faixa, data) em hierarquia visual adequada ao toque.
- **Detalhe**: grid `md:grid-cols-2 lg:grid-cols-3` que vira coluna única no mobile.
- **CTAs**: pill buttons (`rounded-full`) com `flex-wrap` para empilhar quando faltar espaço.

### Tabela desktop com altura estável + grid visual

Pra evitar "pulo" entre páginas (quando a última tem menos itens) e colunas dançando conforme o conteúdo:

- `<colgroup>` + `table-fixed` fixa as larguras das colunas (não recalculam entre páginas)
- Empty rows preenchem até `pageSize` na última página (altura constante)
- `line-clamp-1` + `title` nos textos longos (razão social) — preserva info via tooltip nativo
- Bordas verticais (`border-r`) entre células dão estrutura visual de grid

### `fileParallelism: false` no Vitest do `apps/api`

As suites `leads.routes.test.ts` e `cnpj.routes.test.ts` brigavam pelo mesmo Postgres rodando em paralelo. Forçar serial elimina race conditions sem precisar de DB de teste separado.

### Erros de domínio com `code` literal + `statusCode`

Classes herdam de `DomainError` (campo `code` literal e `statusCode` mapeado). O handler global do Fastify formata a resposta de forma padronizada (sem vazar stack trace) e o front consome `error.code` pra exibir mensagens user-friendly em PT-BR.

### Design alinhado à marca Letalk

Paleta brand `#6B62D1`, surfaces `#F7F7F7`/`#FFFFFF`, borders `#EDEDED`, texto `#242424`/`#7A7A7A`. CTAs pill (`rounded-full`), cards 12px (`rounded-xl`), font weight `500` em headings (não bold pesado). Logo oficial da Letalk no header e pacote completo de favicons (`favicon.io`).

---

## 🤖 Se e como a IA me ajudou

Usei o **Claude Code** (Anthropic) como pair-programmer durante todo o projeto, num fluxo de **desenvolvimento incremental por fatias validadas**:

1. **Eu** defini stack, arquitetura por módulos, regras (registradas em `Claude.MD`) e o roteiro de slices (monorepo → shared → api boot → módulo CNPJ → módulo Leads → frontend → polimento).
2. **Claude** implementou cada slice e rodou os testes/typecheck a cada passo. Antes de partir pra próxima, eu validava (build, comportamento, UX).
3. Decisões críticas (Prisma 6 vs 7, schema de unique, formato da resposta de erro, estratégia de cache, design tokens) foram **discutidas antes** — IA propunha trade-offs, eu escolhia.
4. Refactors de Clean Code e SOLID (Fatia A backend, Fatia B frontend) saíram de uma auditoria conjunta com pontos concretos (file:line) e foram aplicados em incrementos pequenos.
5. Bugs encontrados via QA (cargo opcional rejeitando vazio, tabela ilegível em mobile, "Ver detalhes" cortado) também foram corrigidos em pair.

O que eu **não** terceirizei pra IA:

- Escolha de stack e tradeoffs arquiteturais
- Decisões de produto (unique composto, retornar snapshot junto, cache TTL)
- Validação visual em cada slice
- Aprovação dos commits

---

## ⏱ Tempo gasto

**~16h** ao longo de **2 dias** (14 e 15 de maio de 2026).

| Fase                                                                      | Tempo aproximado |
| ------------------------------------------------------------------------- | ---------------- |
| Setup do monorepo + shared (validação CNPJ, mapas, schemas)               | 3h               |
| Backend completo (boot, módulo CNPJ, módulo Leads, error handler, testes) | 5h               |
| Frontend completo (form, histórico, detalhe, navegação)                   | 4h               |
| Redesign para identidade Letalk (cores, fonte, pill buttons, cards)       | 1h               |
| QA, ajustes de UX (mobile responsivo, alinhamento, ícones, 404)           | 2h               |
| Refactor Clean Code/SOLID + atualização do `Claude.MD`                    | 1h               |

---

## 🔮 Se eu tivesse mais tempo

- **Suporte a CNPJ alfanumérico** ✨ — a partir de **junho/2026** a Receita Federal passa a emitir CNPJs com letras (`12.ABC.345/01DE-35`). O algoritmo dos dígitos verificadores muda (ASCII − 48 em vez do dígito). Hoje o projeto valida só o formato numérico legado. Refatoração futura: aceitar ambos, com flag de modo, e **decidir o que fazer com a máscara** — máscara aceitando letras fica visualmente estranha durante a transição. Provavelmente vou tirar a máscara e validar só on-blur.
- **Máscara visual** nos campos CNPJ e telefone enquanto o usuário digita (hoje só formata depois de salvar) — com `react-imask` ou similar
- **Auth + multi-tenant** — cada vendedor enxerga só seus próprios leads, com soft-delete e auditoria de alterações
- **Filtros e busca no histórico** — por segmento, faixa, data, texto livre
- **Export CSV/Excel** da lista
- **Webhook** quando um lead é criado (integração com CRM externo)
- **Refresh automático** do snapshot quando passar do TTL (job background) em vez de invalidar lazy
- **Telemetria** (Sentry no front, OpenTelemetry no back)

## 📝 Licença

[MIT License](LICENSE)

Feito por [Isaque de Sousa](https://github.com/isaqu3d) — deixa uma ⭐️!
