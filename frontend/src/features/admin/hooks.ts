import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listRestaurants,
  updateRestaurantStatus,
} from "@/api/admin";

export const RESTAURANTS_QUERY_KEY = ["admin", "restaurants"] as const;

export const useRestaurantsQuery = () =>
  useQuery({
    queryKey: RESTAURANTS_QUERY_KEY,
    queryFn: listRestaurants,
  });

export const useUpdateRestaurantStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statutAbonnement,
    }: {
      id: string;
      statutAbonnement: "actif" | "suspendu";
    }) => updateRestaurantStatus(id, statutAbonnement),
    onSuccess: (restaurant) => {
      toast.success(
        restaurant.statutAbonnement === "actif"
          ? "Restaurant activé"
          : "Restaurant suspendu"
      );
      queryClient.invalidateQueries({ queryKey: RESTAURANTS_QUERY_KEY });
    },
  });
};
