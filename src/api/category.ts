import apiClient from "./client";
import type {
  CategoryRequestDTO,
  CategoryResponseDTO,
} from "@/types";

export const categoryApi = {
  insert(data: CategoryRequestDTO): Promise<CategoryResponseDTO> {
    return apiClient.post("/category", data).then((res) => res.data);
  },

  getAll(): Promise<CategoryResponseDTO[]> {
    return apiClient.get("/category/all").then((res) => res.data);
  },

  getById(id: number): Promise<CategoryResponseDTO> {
    return apiClient.get(`/category/${id}`).then((res) => res.data);
  },

  update(id: number, data: CategoryRequestDTO): Promise<CategoryResponseDTO> {
    return apiClient.put(`/category/${id}`, data).then((res) => res.data);
  },

  delete(id: number): Promise<string> {
    return apiClient.delete(`/category/${id}`).then((res) => res.data);
  },
};
