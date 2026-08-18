import apiClient from "./client";
import type {
  LoginRequestDTO,
  UserRequestDTO,
  UserResponseDto,
  TokenResponseDTO,
} from "@/types";

export const userApi = {
  login(data: LoginRequestDTO): Promise<TokenResponseDTO> {
    return apiClient.post("/user/login", data).then((res) => res.data);
  },

  register(data: UserRequestDTO): Promise<TokenResponseDTO> {
    return apiClient.post("/user", data).then((res) => res.data);
  },

  getProfile(): Promise<UserResponseDto> {
    return apiClient.get("/user").then((res) => res.data);
  },

  update(data: UserRequestDTO): Promise<UserResponseDto> {
    return apiClient.put("/user", data).then((res) => res.data);
  },

  delete(): Promise<string> {
    return apiClient.delete("/user").then((res) => res.data);
  },
};
