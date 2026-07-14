export interface AuthUser {
  id: string;
  nom: string;
  email: string;
  role: string;
  restaurantId: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  nom: string;
  adresse: string | null;
  logoUrl: string | null;
  statutAbonnement: string;
  createdAt: string;
}

export interface RegisterPayload {
  nomRestaurant: string;
  adresse?: string;
  nomGerant: string;
  email: string;
  motDePasse: string;
}

export interface LoginPayload {
  email: string;
  motDePasse: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  motDePasse: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}
