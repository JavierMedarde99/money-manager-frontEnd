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

export interface DebtRequestDTO {
  name: string;
  totalAmount?: number;
  starDate: string;
  endDate?: string;
}

export interface DebtResponseDTO {
  id: number;
  name: string;
  totalAmount: number;
  starDate: string;
  endDate: string;
  payments: PaymentResponseDTO[];
}

export interface PaymentRequestDTO {
  paymentDate: string;
  amount: number;
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
  page?: number;
  size?: number;
}
