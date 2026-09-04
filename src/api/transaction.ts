import apiClient from "./client";
import type {
  TransactionRequestDTO,
  TransactionResponseDTO,
  PageTransactionResponseDTO,
  TransactionFilters,
} from "@/types";

export const transactionApi = {
  insert(data: TransactionRequestDTO): Promise<TransactionResponseDTO> {
    return apiClient.post("/transaction", data).then((res) => res.data);
  },

  getAll(filters?: TransactionFilters): Promise<PageTransactionResponseDTO> {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.subType) params.append("subType", filters.subType);
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);
    if (filters?.page !== undefined) params.append("page", String(filters.page));
    if (filters?.size !== undefined) params.append("size", String(filters.size));

    const queryString = params.toString();
    const url = queryString ? `/transaction/all?${queryString}` : "/transaction/all";
    return apiClient.get(url).then((res) => res.data);
  },

  getById(id: number): Promise<TransactionResponseDTO> {
    return apiClient.get(`/transaction/${id}`).then((res) => res.data);
  },

  update(id: number, data: TransactionRequestDTO): Promise<TransactionResponseDTO> {
    return apiClient.put(`/transaction/${id}`, data).then((res) => res.data);
  },

  delete(id: number): Promise<string> {
    return apiClient.delete(`/transaction/${id}`).then((res) => res.data);
  },
};
