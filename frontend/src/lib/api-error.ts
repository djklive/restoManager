import axios from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string") return message;
    return error.message || "Une erreur est survenue";
  }

  if (error instanceof Error) return error.message;
  return "Une erreur est survenue";
};
