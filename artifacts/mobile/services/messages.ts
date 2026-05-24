import { apiFetch } from "./api";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export const MessagesService = {
  async listConversation(withUserId: string): Promise<Message[]> {
    return apiFetch<Message[]>(`/messages?withUserId=${encodeURIComponent(withUserId)}`);
  },

  async send(receiverId: string, content: string, bookingId?: string): Promise<Message> {
    return apiFetch<Message>("/messages", {
      method: "POST",
      body: { receiverId, content, bookingId },
    });
  },

  async markRead(id: string): Promise<void> {
    await apiFetch(`/messages/${id}/read`, { method: "PATCH" });
  },
};
