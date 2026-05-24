import { apiFetch } from "./api";
import type { Booking } from "@/context/BookingContext";

interface CreateBookingParams {
  providerId: string;
  providerName: string;
  service: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  totalCost: number;
  notes?: string;
}

interface ReviewParams {
  rating: number;
  text?: string;
  customerName?: string;
  customerAvatar?: string;
}

export const BookingsService = {
  async list(): Promise<Booking[]> {
    return apiFetch<Booking[]>("/bookings");
  },

  async get(id: string): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}`);
  },

  async create(params: CreateBookingParams): Promise<Booking> {
    return apiFetch<Booking>("/bookings", {
      method: "POST",
      body: params,
    });
  },

  async updateStatus(
    id: string,
    status: "pending" | "active" | "completed" | "cancelled"
  ): Promise<Booking> {
    return apiFetch<Booking>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  async submitReview(bookingId: string, params: ReviewParams): Promise<void> {
    await apiFetch(`/bookings/${bookingId}/review`, {
      method: "POST",
      body: params,
    });
  },
};
