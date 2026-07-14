import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  forgotPassword,
  login,
  registerRestaurant,
  resetPassword,
} from "@/api/auth";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/api/types";
import { AUTH_ME_QUERY_KEY } from "@/features/auth/useAuth";

const dashboardPathForRole = (role: string) => {
  if (role === "ADMIN") return "/admin/restaurants";
  if (role === "GERANT") return "/dashboard";
  return "/dashboard";
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, data.user);
      toast.success("Connexion réussie");
      navigate(dashboardPathForRole(data.user.role), { replace: true });
    },
  });
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerRestaurant(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, data.user);
      toast.success("Restaurant créé avec succès");
      navigate("/dashboard", { replace: true });
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });
};

export const useResetPasswordMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login", { replace: true });
    },
  });
};
