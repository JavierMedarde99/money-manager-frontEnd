export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface UserRequestDTO {
  username: string;
  password?: string;
  email: string;
}

export interface UserResponseDto {
  username: string;
  email: string;
}

export interface TokenResponseDTO {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
}

export interface CategoryRequestDTO {
  name: string;
  color: string;
}

export interface CategoryResponseDTO {
  id: number;
  name: string;
  color: string;
}

export interface TransactionRequestDTO {
  name: string;
  transactionDate: string;
  amount?: number;
  price?: number;
  transactionType: string;
  transactionSubtype: string;
  category: CategoryResponseDTO;
}

export interface TransactionResponseDTO {
  id: number;
  name: string;
  transactionDate: string;
  amount: number;
  price: number;
  transactionType: string;
  transactionSubtype: string;
  category: CategoryResponseDTO;
}

export interface PageTransactionResponseDTO {
  content: TransactionResponseDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageCategoryResponseDTO {
  content: CategoryResponseDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DebtRequestDTO {
  name: string;
  totalAmount?: number;
  startDate: string;
  endDate?: string;
}

export interface DebtResponseDTO {
  id: number;
  name: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  payments: PagePaymentResponseDTO;
}

export interface PagePaymentResponseDTO {
  content: PaymentResponseDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PaymentRequestDTO {
  paymentDate: string;
  amount: number;
  automaticPayment: boolean;
  debt: DebtResponseDTO;
}

export interface PaymentResponseDTO {
  id: number;
  paymentDate: string;
  amount: number;
}

export interface TransactionFilters {
  type?: string;
  subType?: string;
  from?: string;
  to?: string;
  category?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
  page?: number;
  size?: number;
}

/** Select options for the transaction type, shared by form and filters. */
export const TRANSACTION_TYPES = [
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Gasto" },
];

/** The backend accepts both types (see Type.java: INCOME/EXPENSE). */
export const SUPPORTED_TRANSACTION_TYPES = ["INCOME", "EXPENSE"];

/** Falls back to INCOME only for unknown values. */
export function normalizeTransactionType(value: string): string {
  const upper = value.toUpperCase();
  return SUPPORTED_TRANSACTION_TYPES.includes(upper) ? upper : "INCOME";
}

export interface SavingsResponseDTO {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  savings: number;
}
