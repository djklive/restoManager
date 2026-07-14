import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createUser,
  listUsers,
  updateUserStatus,
  type CreateUserPayload,
} from "@/api/users";

export const USERS_QUERY_KEY = ["users"] as const;

export const useUsersQuery = () =>
  useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: listUsers,
  });

export const useCreateUserMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("Membre ajouté");
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onSuccess?.();
    },
  });
};

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      updateUserStatus(id, actif),
    onSuccess: (user) => {
      toast.success(
        user.actif ? "Compte activé" : "Compte désactivé"
      );
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
