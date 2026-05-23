import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type BookingStatus = "pending" | "active" | "completed" | "cancelled";
export type CategoryType = "elderly-care" | "delivery" | "home-services";

export interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  experience: string;
  pricePerHour: number;
  category: CategoryType;
  specialty: string;
  isVerified: boolean;
  photo?: string;
  phone: string;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  service: string;
  category: CategoryType;
  status: BookingStatus;
  date: string;
  time: string;
  duration: number;
  totalCost: number;
  notes?: string;
  rating?: number;
  review?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "booking" | "provider" | "system";
}

interface BookingContextType {
  bookings: Booking[];
  notifications: Notification[];
  addBooking: (b: Omit<Booking, "id">) => void;
  updateBooking: (id: string, data: Partial<Booking>) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
}

const MOCK_PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "Sofia Martinelli",
    rating: 4.9,
    reviews: 124,
    experience: "8 years",
    pricePerHour: 18,
    category: "elderly-care",
    specialty: "Alzheimer Care",
    isVerified: true,
    phone: "+39 349 112 2334",
  },
  {
    id: "p2",
    name: "Antonio Ricci",
    rating: 4.7,
    reviews: 89,
    experience: "5 years",
    pricePerHour: 16,
    category: "elderly-care",
    specialty: "Full Assistance",
    isVerified: true,
    phone: "+39 347 998 1122",
  },
  {
    id: "p3",
    name: "Francesca Romano",
    rating: 4.8,
    reviews: 201,
    experience: "3 years",
    pricePerHour: 14,
    category: "delivery",
    specialty: "Pharmacy Shopping",
    isVerified: true,
    phone: "+39 348 445 6677",
  },
  {
    id: "p4",
    name: "Luca Colombo",
    rating: 4.6,
    reviews: 67,
    experience: "4 years",
    pricePerHour: 15,
    category: "home-services",
    specialty: "Plumbing & Electrical",
    isVerified: true,
    phone: "+39 341 334 5566",
  },
  {
    id: "p5",
    name: "Elena Conti",
    rating: 4.9,
    reviews: 312,
    experience: "10 years",
    pricePerHour: 20,
    category: "elderly-care",
    specialty: "Dementia & Disability",
    isVerified: true,
    phone: "+39 345 778 9900",
  },
  {
    id: "p6",
    name: "Roberto Esposito",
    rating: 4.5,
    reviews: 45,
    experience: "2 years",
    pricePerHour: 13,
    category: "home-services",
    specialty: "Gardening & Cleaning",
    isVerified: true,
    phone: "+39 342 667 8811",
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Booking Confirmed",
    message: "Your booking with Sofia Martinelli is confirmed for tomorrow at 9:00 AM.",
    time: "2 min ago",
    read: false,
    type: "booking",
  },
  {
    id: "n2",
    title: "Provider On The Way",
    message: "Antonio Ricci is heading to your location. ETA: 15 minutes.",
    time: "1 hour ago",
    read: false,
    type: "provider",
  },
  {
    id: "n3",
    title: "Welcome to CuraVicino!",
    message: "Thank you for joining. Always Close, Always Caring.",
    time: "Yesterday",
    read: true,
    type: "system",
  },
];

export const PROVIDERS = MOCK_PROVIDERS;

const BookingContext = createContext<BookingContextType>({
  bookings: [],
  notifications: [],
  addBooking: () => {},
  updateBooking: () => {},
  markNotificationRead: () => {},
  unreadCount: 0,
});

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  useEffect(() => {
    AsyncStorage.getItem("curavicino_bookings").then((v) => {
      if (v) setBookings(JSON.parse(v));
    });
  }, []);

  const saveBookings = async (b: Booking[]) => {
    setBookings(b);
    await AsyncStorage.setItem("curavicino_bookings", JSON.stringify(b));
  };

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addBooking = (b: Omit<Booking, "id">) => {
    const newBooking = { ...b, id: generateId() };
    saveBookings([newBooking, ...bookings]);
    const newNotif: Notification = {
      id: generateId(),
      title: "Booking Confirmed",
      message: `Your booking for ${b.service} is confirmed.`,
      time: "Just now",
      read: false,
      type: "booking",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateBooking = (id: string, data: Partial<Booking>) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, ...data } : b));
    saveBookings(updated);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <BookingContext.Provider
      value={{ bookings, notifications, addBooking, updateBooking, markNotificationRead, unreadCount }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}

export { MOCK_PROVIDERS as providers };
