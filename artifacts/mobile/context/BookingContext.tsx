import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { TokenStore } from "@/services/api";
import { BookingsService } from "@/services/bookings";
import { NotificationsService } from "@/services/notifications";
import { ProvidersService } from "@/services/providers";

export type BookingStatus = "pending" | "active" | "completed" | "cancelled";
export type CategoryType = "elderly-care" | "delivery" | "home-services";
export type AvailabilityStatus = "available" | "busy" | "offline";

export interface ProviderReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
}

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
  phone: string;
  heroImage: string;
  profilePhoto: string;
  gallery: string[];
  about: string;
  certifications: string[];
  languages: string[];
  serviceAreas: string[];
  availabilityStatus: AvailabilityStatus;
  responseTime: string;
  completedServices: number;
  memberSince: string;
  reviewsList: ProviderReview[];
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
  addBooking: (b: Omit<Booking, "id">) => Promise<void>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  submitReview: (bookingId: string, rating: number, text: string, customerName?: string) => Promise<void>;
  refreshBookings: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  unreadCount: number;
}

/* ─── Static provider data (offline-safe, used by profile screens) ───────────── */
const STATIC_PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "Sofia Martinelli",
    rating: 4.9,
    reviews: 89,
    experience: "7 years",
    pricePerHour: 28,
    category: "elderly-care",
    specialty: "Alzheimer & Dementia Care Specialist",
    isVerified: true,
    phone: "",
    heroImage: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&q=85&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=85&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=85&fit=crop",
    ],
    about: "Certified geriatric care specialist with 12 years of experience in Alzheimer and dementia care. I provide compassionate, dignified support while maintaining the highest professional standards. Fluent in Italian, English, and Spanish.",
    certifications: ["Certified Geriatric Care Manager (CGCM)", "Alzheimer's Care Specialist", "CPR & First Aid Certified", "Dementia Care Training (Level 3)"],
    languages: ["Italian", "English", "Spanish"],
    serviceAreas: ["Milano Centro", "Navigli", "Porta Romana", "Lambrate"],
    availabilityStatus: "available",
    responseTime: "< 30 min",
    completedServices: 347,
    memberSince: "Member since 2019",
    reviewsList: [],
  },
  {
    id: "p2",
    name: "Marco Bianchi",
    rating: 4.7,
    reviews: 54,
    experience: "5 years",
    pricePerHour: 22,
    category: "elderly-care",
    specialty: "Home Care & Disability Support",
    isVerified: true,
    phone: "",
    heroImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&q=85&fit=crop",
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&q=85&fit=crop",
    ],
    about: "Dedicated home care professional specialising in physical disability support, post-surgery recovery, and daily living assistance.",
    certifications: ["Home Health Aide Certified", "Disability Support Worker", "CPR Certified"],
    languages: ["Italian", "English"],
    serviceAreas: ["Torino Centro", "Mirafiori", "San Salvario"],
    availabilityStatus: "available",
    responseTime: "< 1 hour",
    completedServices: 201,
    memberSince: "Member since 2020",
    reviewsList: [],
  },
  {
    id: "p3",
    name: "Elena Russo",
    rating: 4.8,
    reviews: 112,
    experience: "4 years",
    pricePerHour: 15,
    category: "delivery",
    specialty: "Pharmacy & Grocery Delivery",
    isVerified: true,
    phone: "",
    heroImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&q=85&fit=crop",
      "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400&q=85&fit=crop",
    ],
    about: "Fast and reliable delivery specialist for pharmacies, supermarkets and local shops. Available 7 days a week.",
    certifications: ["Food Handling Certificate", "Driver's License (B)", "Customer Service Excellence"],
    languages: ["Italian"],
    serviceAreas: ["Roma Centro", "Prati", "Trastevere", "Testaccio"],
    availabilityStatus: "available",
    responseTime: "< 45 min",
    completedServices: 528,
    memberSince: "Member since 2021",
    reviewsList: [],
  },
  {
    id: "p4",
    name: "Luigi Ferrari",
    rating: 4.6,
    reviews: 178,
    experience: "15 years",
    pricePerHour: 35,
    category: "home-services",
    specialty: "Plumbing & Electrical Repair",
    isVerified: true,
    phone: "",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=85&fit=crop",
    ],
    about: "Master plumber and electrician with 15 years of experience. All work guaranteed and fully insured.",
    certifications: ["Licensed Master Plumber", "Certified Electrician (Type B)", "Gas Safety Certificate"],
    languages: ["Italian"],
    serviceAreas: ["Napoli Centro", "Posillipo", "Vomero"],
    availabilityStatus: "busy",
    responseTime: "< 2 hours",
    completedServices: 683,
    memberSince: "Member since 2018",
    reviewsList: [],
  },
  {
    id: "p5",
    name: "Anna Conti",
    rating: 4.9,
    reviews: 97,
    experience: "5 years",
    pricePerHour: 18,
    category: "home-services",
    specialty: "House Cleaning & Organisation",
    isVerified: true,
    phone: "",
    heroImage: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=85&fit=crop",
    ],
    about: "Professional home cleaning and organisation specialist. I use eco-friendly products and pay attention to every detail.",
    certifications: ["Professional Cleaning Certificate", "Eco-Clean Certified"],
    languages: ["Italian", "Romanian"],
    serviceAreas: ["Firenze Centro", "Oltrarno", "Campo di Marte"],
    availabilityStatus: "available",
    responseTime: "< 1 hour",
    completedServices: 412,
    memberSince: "Member since 2020",
    reviewsList: [],
  },
  {
    id: "p6",
    name: "Roberto Palermo",
    rating: 4.5,
    reviews: 61,
    experience: "4 years",
    pricePerHour: 14,
    category: "delivery",
    specialty: "Restaurant & Mall Delivery",
    isVerified: false,
    phone: "",
    heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&q=85&fit=crop",
    ],
    about: "Reliable delivery driver specialising in restaurant food delivery and mall shopping.",
    certifications: ["Food Safety Level 2", "Driver's License (B+C)"],
    languages: ["Italian", "English"],
    serviceAreas: ["Bologna Centro", "San Vitale", "Mazzini"],
    availabilityStatus: "offline",
    responseTime: "< 1 hour",
    completedServices: 289,
    memberSince: "Member since 2021",
    reviewsList: [],
  },
];

export const PROVIDERS = STATIC_PROVIDERS;

/* ─── AsyncStorage fallback cache ────────────────────────────────────────────── */
const CACHE_BOOKINGS = "cv_bookings_cache";
const CACHE_NOTIFS = "cv_notifs_cache";

/* ─── Context ────────────────────────────────────────────────────────────────── */
const BookingContext = createContext<BookingContextType>({
  bookings: [],
  notifications: [],
  addBooking: async () => {},
  updateBooking: async () => {},
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
  submitReview: async () => {},
  refreshBookings: async () => {},
  refreshNotifications: async () => {},
  unreadCount: 0,
});

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* ── Load on mount ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    loadFromCache();
    loadFromApi();
    // Also seed providers in case DB is fresh (idempotent)
    ProvidersService.seed().catch(() => {});
  }, []);

  async function loadFromCache() {
    try {
      const [bRaw, nRaw] = await Promise.all([
        AsyncStorage.getItem(CACHE_BOOKINGS),
        AsyncStorage.getItem(CACHE_NOTIFS),
      ]);
      if (bRaw) setBookings(JSON.parse(bRaw));
      if (nRaw) setNotifications(JSON.parse(nRaw));
    } catch {
      /* ignore */
    }
  }

  async function loadFromApi() {
    const token = await TokenStore.getAccess();
    if (!token) return;
    try {
      const [apiBookings, apiNotifs] = await Promise.all([
        BookingsService.list(),
        NotificationsService.list(),
      ]);
      setBookings(apiBookings);
      setNotifications(apiNotifs);
      await AsyncStorage.setItem(CACHE_BOOKINGS, JSON.stringify(apiBookings));
      await AsyncStorage.setItem(CACHE_NOTIFS, JSON.stringify(apiNotifs));
    } catch {
      /* Fall back to cached data */
    }
  }

  /* ── Refresh helpers (callable from screens) ──────────────────────────────── */
  const refreshBookings = async () => {
    const token = await TokenStore.getAccess();
    if (!token) return;
    try {
      const apiBookings = await BookingsService.list();
      setBookings(apiBookings);
      await AsyncStorage.setItem(CACHE_BOOKINGS, JSON.stringify(apiBookings));
    } catch {
      /* ignore */
    }
  };

  const refreshNotifications = async () => {
    const token = await TokenStore.getAccess();
    if (!token) return;
    try {
      const apiNotifs = await NotificationsService.list();
      setNotifications(apiNotifs);
      await AsyncStorage.setItem(CACHE_NOTIFS, JSON.stringify(apiNotifs));
    } catch {
      /* ignore */
    }
  };

  /* ── Add Booking ──────────────────────────────────────────────────────────── */
  const addBooking = async (b: Omit<Booking, "id">) => {
    const token = await TokenStore.getAccess();

    if (token) {
      try {
        const created = await BookingsService.create({
          providerId: b.providerId,
          providerName: b.providerName,
          service: b.service,
          category: b.category,
          date: b.date,
          time: b.time,
          duration: b.duration,
          totalCost: b.totalCost,
          notes: b.notes,
        });
        const updated = [created, ...bookings];
        setBookings(updated);
        await AsyncStorage.setItem(CACHE_BOOKINGS, JSON.stringify(updated));
        /* Reload notifications so the booking-confirmed notification appears */
        await refreshNotifications();
        return;
      } catch {
        /* Fall through to local fallback */
      }
    }

    /* Offline / unauthenticated fallback */
    const localId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newBooking: Booking = { ...b, id: localId };
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    await AsyncStorage.setItem(CACHE_BOOKINGS, JSON.stringify(updated));

    const newNotif: Notification = {
      id: localId + "_n",
      title: "Booking Confirmed",
      message: `Your booking for ${b.service} is confirmed.`,
      time: "Just now",
      read: false,
      type: "booking",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  /* ── Update Booking ────────────────────────────────────────────────────────── */
  const updateBooking = async (id: string, data: Partial<Booking>) => {
    /* Optimistic local update first */
    const updated = bookings.map((b) => (b.id === id ? { ...b, ...data } : b));
    setBookings(updated);
    await AsyncStorage.setItem(CACHE_BOOKINGS, JSON.stringify(updated));

    /* Sync to API if status changed */
    if (data.status) {
      const token = await TokenStore.getAccess();
      if (token) {
        try {
          await BookingsService.updateStatus(id, data.status);
        } catch {
          /* Revert on failure */
          setBookings(bookings);
          await AsyncStorage.setItem(CACHE_BOOKINGS, JSON.stringify(bookings));
        }
      }
    }
  };

  /* ── Submit Review ─────────────────────────────────────────────────────────── */
  const submitReview = async (
    bookingId: string,
    rating: number,
    text: string,
    customerName?: string
  ) => {
    const token = await TokenStore.getAccess();
    if (token) {
      await BookingsService.submitReview(bookingId, { rating, text, customerName });
    }
    /* Update local booking with review */
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, rating, review: text } : b
    );
    setBookings(updated);
    await AsyncStorage.setItem(CACHE_BOOKINGS, JSON.stringify(updated));
  };

  /* ── Notifications ─────────────────────────────────────────────────────────── */
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    NotificationsService.markRead(id).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    NotificationsService.markAllRead().catch(() => {});
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <BookingContext.Provider
      value={{
        bookings,
        notifications,
        addBooking,
        updateBooking,
        markNotificationRead,
        markAllNotificationsRead,
        submitReview,
        refreshBookings,
        refreshNotifications,
        unreadCount,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}

export { STATIC_PROVIDERS as providers };
