import apiClient from "./client";
import type {
  CategoryRequestDTO,
  CategoryResponseDTO,
  PageCategoryResponseDTO,
} from "@/types";

export const categoryApi = {
  insert(data: CategoryRequestDTO): Promise<CategoryResponseDTO> {
    return apiClient.post("/category", data).then((res) => res.data);
  },

  getAll(params?: {
    page?: number;
    size?: number;
  }): Promise<PageCategoryResponseDTO> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));
    const qs = query.toString();
    const url = qs ? `/category/all?${qs}` : "/category/all";
    return apiClient.get(url).then((res) => res.data);
  },

  /** Lista completa para selects/dropdowns (el backend solo expone paginado). */
  getAllForOptions(): Promise<CategoryResponseDTO[]> {
    return apiClient
      .get("/category/all?page=0&size=1000&sortBy=id&direction=ASC")
      .then((res) => res.data.content);
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