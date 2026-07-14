import { apiClient } from "./client";
import type { ApiSuccessBody, AuthUser } from "./types";

export interface CreateUserPayload {
  nom: string;
  email: string;
  motDePasse: string;
  role: "SERVEUR" | "CAISSIER";
}

export const listUsers = async () => {
  const { data } = await apiClient.get<ApiSuccessBody<{ users: AuthUser[] }>>(
    "/users"
  );
  return data.data.users;
};

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await apiClient.post<ApiSuccessBody<{ user: AuthUser }>>(
    "/users",
    payload
  );
  return data.data.user;
};

export const updateUserStatus = async (id: string, actif: boolean) => {
  const { data } = await apiClient.patch<ApiSuccessBody<{ user: AuthUser }>>(
    `/users/${id}/status`,
    { actif }
  );
  return data.data.user;
};
