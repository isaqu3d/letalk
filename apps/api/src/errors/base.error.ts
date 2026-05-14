export interface DomainErrorParams {
  code: string;
  statusCode: number;
  message: string;
}

export class DomainError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(params: DomainErrorParams) {
    super(params.message);
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.name = this.constructor.name;
  }
}
