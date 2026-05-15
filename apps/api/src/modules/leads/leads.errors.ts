import { DomainError } from "../../errors/base.error";
import { HttpStatus } from "../../shared/http-status";

export class DuplicateLeadError extends DomainError {
  constructor(email: string, cnpj: string) {
    super({
      code: "DUPLICATE_LEAD",
      statusCode: HttpStatus.CONFLICT,
      message: `Já existe lead com este e-mail (${email}) para este CNPJ (${cnpj})`,
    });
  }
}

export class LeadNotFoundError extends DomainError {
  constructor(id: string) {
    super({
      code: "LEAD_NOT_FOUND",
      statusCode: HttpStatus.NOT_FOUND,
      message: `Lead não encontrado: ${id}`,
    });
  }
}
