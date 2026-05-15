const baseUrl = import.meta.env.VITE_API_BASE_URL;

export interface ApiErrorBody {
  code?: string;
  message?: string;
  issues?: Array<{ path: string; message: string }>;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly issues: Array<{ path: string; message: string }>;

  constructor(statusCode: number, body: ApiErrorBody) {
    super(body.message ?? "Erro desconhecido");
    this.statusCode = statusCode;
    this.code = body.code ?? "UNKNOWN_ERROR";
    this.issues = body.issues ?? [];
  }
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await parseErrorBody(response);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
