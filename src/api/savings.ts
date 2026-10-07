import apiClient from "./client";
import type { SavingsResponseDTO } from "@/types";

export const savingsApi = {
  getAll(): Promise<SavingsResponseDTO[]> {
    return apiClient.get("/savings").then((res) => res.data);
  },
};