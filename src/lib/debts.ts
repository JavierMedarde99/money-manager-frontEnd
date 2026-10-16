import type { DebtResponseDTO } from "@/types";

/**
 * Cálculos derivados de una deuda. Viven aquí (y no en la página) porque los
 * usan tanto la página como la tarjeta y el diálogo de pagos.
 */

function paidAmount(debt: DebtResponseDTO): number {
  return debt.payments?.content.reduce((sum, p) => sum + p.amount, 0) || 0;
}

export function getRemainingAmount(debt: DebtResponseDTO): number {
  return debt.totalAmount - paidAmount(debt);
}

export function getProgress(debt: DebtResponseDTO): number {
  if (debt.totalAmount === 0) return 100;
  return Math.min(100, (paidAmount(debt) / debt.totalAmount) * 100);
}
