import { apiClient } from "./client";
import type {
  ApiSuccessBody,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  Restaurant,
} from "./types";

export const registerRestaurant = async (payload: RegisterPayload) => {
  const { data } = await apiClient.post<
    ApiSuccessBody<{ user: AuthUser; restaurant: Restaurant }>
  >("/auth/register-restaurant", payload);
  return data.data;
};

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<ApiSuccessBody<{ user: AuthUser }>>(
    "/auth/login",
    payload
  );
  return data.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const { data } = await apiClient.post<ApiSuccessBody<{ message: string }>>(
    "/auth/forgot-password",
    payload
  );
  return data.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const { data } = await apiClient.post<ApiSuccessBody<{ message: string }>>(
    "/auth/reset-password",
    payload
  );
  return data.data;
};

export const getMe = async () => {
  const { data } = await apiClient.get<ApiSuccessBody<{ user: AuthUser }>>(
    "/me"
  );
  return data.data.user;
};

export const logout = async () => {
  const { data } = await apiClient.post<ApiSuccessBody<{ message: string }>>(
    "/auth/logout"
  );
  return data.data;
};
