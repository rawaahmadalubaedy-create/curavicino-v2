import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
    specialty: "Alzheimer & Memory Care",
    isVerified: true,
    phone: "+39 349 112 2334",
    heroImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80&fit=crop",
    ],
    about: "I am a dedicated professional caregiver with over 8 years of specialised experience supporting individuals with Alzheimer's disease and memory conditions. I hold a degree in geriatric nursing from Università di Milano and have completed advanced training in dementia care.\n\nI provide compassionate, dignity-centred care that keeps your loved one safe, engaged, and comfortable at home. My approach combines structured daily routines with gentle cognitive stimulation — proven to slow memory decline.",
    certifications: [
      "Geriatric Nursing Certificate – Università di Milano",
      "Alzheimer's Care Specialist (ACS)",
      "First Aid & CPR Certified",
      "Criminal Record — Clean (2024)",
      "Government ID Verified",
    ],
    languages: ["Italian", "English", "French"],
    serviceAreas: ["Milano Centro", "Navigli", "Porta Romana", "Brera", "Isola"],
    availabilityStatus: "available",
    responseTime: "Under 15 min",
    completedServices: 312,
    memberSince: "March 2017",
    reviewsList: [
      {
        id: "r1",
        author: "Marco B.",
        rating: 5,
        text: "Sofia has been caring for my mother for 6 months. Her patience, professionalism and genuine warmth are extraordinary. Highly recommended.",
        date: "April 2025",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80&fit=crop&crop=face",
      },
      {
        id: "r2",
        author: "Laura C.",
        rating: 5,
        text: "Eccellente professionista. Mia nonna la adora. Sempre puntuale e molto preparata.",
        date: "March 2025",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&fit=crop&crop=face",
      },
      {
        id: "r3",
        author: "Giuseppe M.",
        rating: 5,
        text: "Caring, attentive and incredibly knowledgeable. Sofia made a real difference for our family.",
        date: "February 2025",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
      },
    ],
  },
  {
    id: "p2",
    name: "Antonio Ricci",
    rating: 4.7,
    reviews: 89,
    experience: "5 years",
    pricePerHour: 16,
    category: "elderly-care",
    specialty: "Full-Time Assistance",
    isVerified: true,
    phone: "+39 347 998 1122",
    heroImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&q=80&fit=crop",
    ],
    about: "I provide comprehensive daily assistance to elderly clients who need support maintaining their independence at home. With 5 years of experience in personal care, mobility assistance and social companionship, I ensure your family member is never alone.\n\nI am trained in safe patient handling, fall prevention, and medication reminders. My calm and dependable presence brings peace of mind to both clients and their families.",
    certifications: [
      "Operatore Socio-Sanitario (OSS) — Regione Lombardia",
      "Safe Patient Handling Certificate",
      "First Aid & CPR Certified",
      "Criminal Record — Clean (2024)",
    ],
    languages: ["Italian", "English"],
    serviceAreas: ["Torino Centro", "San Salvario", "Crocetta", "Lingotto"],
    availabilityStatus: "available",
    responseTime: "Under 30 min",
    completedServices: 203,
    memberSince: "July 2020",
    reviewsList: [
      {
        id: "r1",
        author: "Carla V.",
        rating: 5,
        text: "Antonio is incredibly reliable. My father trusts him completely and they have built a wonderful friendship.",
        date: "May 2025",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&fit=crop&crop=face",
      },
      {
        id: "r2",
        author: "Riccardo F.",
        rating: 4,
        text: "Professional and caring. Always on time. Very good with my elderly mother.",
        date: "April 2025",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80&fit=crop&crop=face",
      },
    ],
  },
  {
    id: "p3",
    name: "Francesca Romano",
    rating: 4.8,
    reviews: 201,
    experience: "3 years",
    pricePerHour: 14,
    category: "delivery",
    specialty: "Pharmacy & Grocery Shopping",
    isVerified: true,
    phone: "+39 348 445 6677",
    heroImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1534723452862-4c874986ebad?w=500&q=80&fit=crop",
    ],
    about: "I specialize in reliable and careful shopping and delivery services for elderly clients and families who are unable to go out. I handle pharmacy prescription pickup, grocery shopping at local markets, and specialty store purchases with attention to every detail on your list.\n\nI treat every order as if I were shopping for my own family — checking expiry dates, picking the freshest produce, and always returning with a receipt.",
    certifications: [
      "Driving Licence Category B (Clean Record)",
      "Food Handling Certificate",
      "Criminal Record — Clean (2024)",
      "Government ID Verified",
    ],
    languages: ["Italian", "English", "Spanish"],
    serviceAreas: ["Roma Centro", "Trastevere", "Prati", "Parioli", "EUR"],
    availabilityStatus: "available",
    responseTime: "Under 20 min",
    completedServices: 489,
    memberSince: "January 2022",
    reviewsList: [
      {
        id: "r1",
        author: "Maria T.",
        rating: 5,
        text: "Francesca è semplicemente perfetta. Sempre disponibile, gentile e precisa. Non posso immaginare senza di lei.",
        date: "May 2025",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&fit=crop&crop=face",
      },
    ],
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
    heroImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=500&q=80&fit=crop",
    ],
    about: "Experienced home maintenance specialist covering all aspects of residential plumbing and electrical repairs. I take pride in clean, efficient work that causes minimal disruption to your home.\n\nI use professional-grade materials only and provide a 90-day workmanship guarantee on all repairs. Safety is my top priority — especially in homes with elderly residents.",
    certifications: [
      "Licensed Electrician — Regione Lombardia",
      "Certified Plumber (Grade B)",
      "Electrical Safety Certificate",
      "Criminal Record — Clean (2024)",
    ],
    languages: ["Italian", "English"],
    serviceAreas: ["Milano", "Monza", "Sesto San Giovanni", "Cinisello Balsamo"],
    availabilityStatus: "busy",
    responseTime: "Under 1 hour",
    completedServices: 156,
    memberSince: "May 2021",
    reviewsList: [
      {
        id: "r1",
        author: "Alberto N.",
        rating: 5,
        text: "Luca fixed our bathroom plumbing in under 2 hours. Professional, tidy and very fairly priced.",
        date: "March 2025",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80&fit=crop&crop=face",
      },
    ],
  },
  {
    id: "p5",
    name: "Elena Conti",
    rating: 4.9,
    reviews: 312,
    experience: "10 years",
    pricePerHour: 20,
    category: "elderly-care",
    specialty: "Dementia & Disability Support",
    isVerified: true,
    phone: "+39 345 778 9900",
    heroImage: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&q=80&fit=crop",
    ],
    about: "With a decade of dedicated experience in dementia and disability care, I am one of CuraVicino's most experienced and trusted professionals. I hold a Master's qualification in Neurological Rehabilitation and have worked across hospital, residential, and home-care settings.\n\nI specialise in creating structured, calm environments that improve quality of life for individuals with advanced dementia, Down syndrome, autism, and acquired brain injuries. My goal is always the same: to preserve dignity and maximise independence.",
    certifications: [
      "Master's in Neurological Rehabilitation – Università di Bologna",
      "Dementia Care Advanced Practitioner",
      "Disability Support Specialist",
      "First Aid, CPR & AED Certified",
      "Criminal Record — Clean (2024)",
      "Government ID Verified",
    ],
    languages: ["Italian", "English", "German"],
    serviceAreas: ["Bologna Centro", "San Vitale", "Savena", "Porto", "Navile"],
    availabilityStatus: "available",
    responseTime: "Under 10 min",
    completedServices: 724,
    memberSince: "September 2015",
    reviewsList: [
      {
        id: "r1",
        author: "Federica M.",
        rating: 5,
        text: "Elena is an absolute angel. She has been with my father for 3 years and has transformed his daily life. I cannot put into words how grateful we are.",
        date: "May 2025",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&fit=crop&crop=face",
      },
      {
        id: "r2",
        author: "Stefano R.",
        rating: 5,
        text: "The most professional carer I have ever hired. Elena brings knowledge, warmth and genuine care to every visit.",
        date: "April 2025",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
      },
      {
        id: "r3",
        author: "Anna P.",
        rating: 5,
        text: "Professionale, puntuale e dolcissima. Mia sorella la adora. Grazie Elena!",
        date: "March 2025",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&fit=crop&crop=face",
      },
    ],
  },
  {
    id: "p6",
    name: "Roberto Esposito",
    rating: 4.5,
    reviews: 45,
    experience: "2 years",
    pricePerHour: 13,
    category: "home-services",
    specialty: "Gardening & House Cleaning",
    isVerified: true,
    phone: "+39 342 667 8811",
    heroImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85&fit=crop",
    profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=85&fit=crop&crop=face",
    gallery: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80&fit=crop",
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=500&q=80&fit=crop",
    ],
    about: "Reliable, thorough and detail-oriented home services professional based in Naples. I offer comprehensive gardening maintenance and deep-clean house cleaning services tailored to each client's home and preferences.\n\nI use eco-friendly products and take particular care in homes with elderly residents, ensuring all work is done quietly and without disruption to daily routines.",
    certifications: [
      "Professional Gardening Certificate",
      "Eco-Cleaning Practitioner",
      "Criminal Record — Clean (2024)",
      "Government ID Verified",
    ],
    languages: ["Italian"],
    serviceAreas: ["Napoli Centro", "Posillipo", "Vomero", "Chiaia"],
    availabilityStatus: "available",
    responseTime: "Under 45 min",
    completedServices: 89,
    memberSince: "November 2022",
    reviewsList: [
      {
        id: "r1",
        author: "Giulia A.",
        rating: 5,
        text: "Roberto transformed our garden completely. Very professional and hardworking young man.",
        date: "April 2025",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&fit=crop&crop=face",
      },
    ],
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
