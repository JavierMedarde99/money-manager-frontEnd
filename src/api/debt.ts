import apiClient from "./client";
import type {
  DebtRequestDTO,
  DebtResponseDTO,
} from "@/types";

export const debtApi = {
  insert(data: DebtRequestDTO): Promise<DebtResponseDTO> {
    return apiClient.post("/debt", data).then((res) => res.data);
  },

  getAll(): Promise<DebtResponseDTO[]> {
    return apiClient.get("/debt/all").then((res) => res.data);
  },

  getById(id: number): Promise<DebtResponseDTO> {
    return apiClient.get(`/debt/${id}`).then((res) => res.data);
  },

  update(id: number, data: DebtRequestDTO): Promise<DebtResponseDTO> {
    return apiClient.put(`/debt/${id}`, data).then((res) => res.data);
  },

  delete(id: number): Promise<string> {
    return apiClient.delete(`/debt/${id}`).then((res) => res.data);
  },
};
