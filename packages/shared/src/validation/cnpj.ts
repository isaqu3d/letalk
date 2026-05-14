const FIRST_CHECK_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const SECOND_CHECK_DIGIT_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const CNPJ_LENGTH = 14;
const NON_DIGIT_PATTERN = /\D/g;
const REPEATED_DIGITS_PATTERN = /^(\d)\1+$/;

export function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(NON_DIGIT_PATTERN, "");
}

export function formatCnpj(cnpj: string): string {
  const digits = normalizeCnpj(cnpj);
  if (digits.length !== CNPJ_LENGTH) {
    return cnpj;
  }
  return (
    `${digits.slice(0, 2)}.` +
    `${digits.slice(2, 5)}.` +
    `${digits.slice(5, 8)}/` +
    `${digits.slice(8, 12)}-` +
    `${digits.slice(12, 14)}`
  );
}

function hasOnlyRepeatedDigits(digits: string): boolean {
  return REPEATED_DIGITS_PATTERN.test(digits);
}

function calculateCheckDigit(digits: string, weights: readonly number[]): number {
  const weightedSum = weights.reduce((sum, weight, index) => {
    const digit = Number(digits.charAt(index));
    return sum + digit * weight;
  }, 0);
  const remainder = weightedSum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(cnpj: string): boolean {
  const digits = normalizeCnpj(cnpj);

  if (digits.length !== CNPJ_LENGTH) {
    return false;
  }

  if (hasOnlyRepeatedDigits(digits)) {
    return false;
  }

  const expectedFirstDigit = calculateCheckDigit(
    digits.slice(0, 12),
    FIRST_CHECK_DIGIT_WEIGHTS,
  );
  if (expectedFirstDigit !== Number(digits.charAt(12))) {
    return false;
  }

  const expectedSecondDigit = calculateCheckDigit(
    digits.slice(0, 13),
    SECOND_CHECK_DIGIT_WEIGHTS,
  );
  if (expectedSecondDigit !== Number(digits.charAt(13))) {
    return false;
  }

  return true;
}
