import apiClient from "./client";
import type {
  PaymentRequestDTO,
  PaymentResponseDTO,
} from "@/types";

export const paymentApi = {
  insert(data: PaymentRequestDTO): Promise<PaymentResponseDTO> {
    return apiClient.post("/payment", data).then((res) => res.data);
  },

  getById(id: number): Promise<PaymentResponseDTO> {
    return apiClient.get(`/payment/${id}`).then((res) => res.data);
  },

  update(id: number, data: PaymentRequestDTO): Promise<PaymentResponseDTO> {
    return apiClient.put(`/payment/${id}`, data).then((res) => res.data);
  },

  delete(id: number): Promise<string> {
    return apiClient.delete(`/payment/${id}`).then((res) => res.data);
  },
};
