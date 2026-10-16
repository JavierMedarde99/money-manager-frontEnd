import apiClient from "./client";
import type {
  DebtRequestDTO,
  DebtResponseDTO,
} from "@/types";

export const debtApi = {
  insert(data: DebtRequestDTO): Promise<DebtResponseDTO> {
    return apiClient.post("/debt", data).then((res) => res.data);
  },

  /**
   * `page` y `size` son obligatorios a propósito: el backend usa `size = 10`
   * por defecto, y un default silencioso hacía que la app mostrara solo las
   * primeras 10 deudas (y calculara mal los totales del Dashboard).
   */
  getAll(page: number, size: number): Promise<DebtResponseDTO[]> {
    return apiClient
      .get("/debt/all", {
        params: { page, size },
      })
      .then((res) => res.data);
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
