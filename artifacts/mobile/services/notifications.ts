import { apiFetch } from "./api";
import type { Notification } from "@/context/BookingContext";

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "provider" | "system";
  read: boolean;
  time: string;
}

function toNotification(n: ApiNotification): Notification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    time: new Date(n.time).toLocaleDateString("it-IT"),
  };
}

export const NotificationsService = {
  async list(): Promise<Notification[]> {
    const data = await apiFetch<ApiNotification[]>("/notifications");
    return data.map(toNotification);
  },

  async markRead(id: string): Promise<void> {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
  },

  async markAllRead(): Promise<void> {
    await apiFetch("/notifications/read-all", { method: "PATCH" });
  },
};
