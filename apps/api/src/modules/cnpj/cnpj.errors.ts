import { DomainError } from "../../errors/base.error";
import { HttpStatus } from "../../shared/http-status";

export class InvalidCnpjError extends DomainError {
  constructor(cnpj: string) {
    super({
      code: "INVALID_CNPJ",
      statusCode: HttpStatus.BAD_REQUEST,
      message: `CNPJ inválido: ${cnpj}`,
    });
  }
}

export class CnpjNotFoundError extends DomainError {
  constructor(cnpj: string) {
    super({
      code: "CNPJ_NOT_FOUND",
      statusCode: HttpStatus.NOT_FOUND,
      message: `CNPJ não encontrado na BrasilAPI: ${cnpj}`,
    });
  }
}

export class BrasilApiUnavailableError extends DomainError {
  constructor(reason: string) {
    super({
      code: "BRASIL_API_UNAVAILABLE",
      statusCode: HttpStatus.BAD_GATEWAY,
      message: `BrasilAPI indisponível: ${reason}`,
    });
  }
}
