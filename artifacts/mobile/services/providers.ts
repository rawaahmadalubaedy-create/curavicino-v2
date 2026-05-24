import { apiFetch } from "./api";
import type { Provider } from "@/context/BookingContext";
import type { CategoryType } from "@/context/BookingContext";

export const ProvidersService = {
  async list(category?: CategoryType): Promise<Provider[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return apiFetch<Provider[]>(`/providers${query}`, { auth: false });
  },

  async get(id: string): Promise<Provider> {
    return apiFetch<Provider>(`/providers/${id}`, { auth: false });
  },

  /** Seed providers into DB — call once after server cold-start */
  async seed(): Promise<void> {
    await apiFetch("/providers/seed", { method: "POST", auth: false });
  },
};
