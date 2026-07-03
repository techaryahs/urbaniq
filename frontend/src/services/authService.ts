import api from "../api/axios";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: "researcher" | "city_planner";
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};
