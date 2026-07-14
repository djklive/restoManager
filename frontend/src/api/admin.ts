import { apiClient } from "./client";
import type { ApiSuccessBody, Restaurant } from "./types";

export interface AdminRestaurant extends Restaurant {
  nombreUtilisateurs: number;
}

export const listRestaurants = async () => {
  const { data } = await apiClient.get<
    ApiSuccessBody<{ restaurants: AdminRestaurant[] }>
  >("/admin/restaurants");
  return data.data.restaurants;
};

export const updateRestaurantStatus = async (
  id: string,
  statutAbonnement: "actif" | "suspendu"
) => {
  const { data } = await apiClient.patch<
    ApiSuccessBody<{ restaurant: Restaurant }>
  >(`/admin/restaurants/${id}/status`, { statutAbonnement });
  return data.data.restaurant;
};
