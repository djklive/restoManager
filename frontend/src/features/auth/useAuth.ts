import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getMe, logout as logoutRequest } from "@/api/auth";
import type { AuthUser } from "@/api/types";

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isUnauthorized =
    axios.isAxiosError(query.error) && query.error.response?.status === 401;

  const user: AuthUser | null =
    query.data && !isUnauthorized ? query.data : null;

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
      navigate("/login", { replace: true });
    }
  };

  const setUser = (nextUser: AuthUser | null) => {
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, nextUser);
  };

  return {
    user,
    isLoading: query.isPending,
    isAuthenticated: Boolean(user),
    error: query.error,
    logout,
    setUser,
    refetch: query.refetch,
  };
}
