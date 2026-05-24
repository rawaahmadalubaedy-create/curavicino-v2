import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { AuthService, ApiUser } from "@/services/auth";
import { TokenStore } from "@/services/api";
import { realtimeClient } from "@/services/realtime";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
export type UserType = "customer" | "provider" | null;

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: UserType;
  age?: number;
  address?: string;
  forFamilyMember?: boolean;
  isVerified?: boolean;
  rating?: number;
  photo?: string;
  qrCode?: string;
  withdrawalPreference?: "daily" | "weekly" | "monthly";
  bankLinked?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  registerCustomer: (data: Partial<User> & { password?: string }) => Promise<void>;
  registerProvider: (data: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const USER_KEY = "curavicino_user";

function apiUserToUser(u: ApiUser): User {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    userType: u.userType as UserType,
    age: u.age,
    address: u.address,
    forFamilyMember: u.forFamilyMember,
    isVerified: u.isVerified,
    photo: u.photo,
    withdrawalPreference: u.withdrawalPreference,
    bankLinked: u.bankLinked,
  };
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/* Fallback mock when API is unreachable (demo / offline mode) */
function mockUser(overrides: Partial<User>): User {
  return {
    id: generateId(),
    fullName: overrides.fullName ?? "Mario Rossi",
    email: overrides.email ?? "demo@curavicino.it",
    phone: overrides.phone ?? "+39 345 678 9012",
    userType: overrides.userType ?? "customer",
    age: overrides.age ?? 45,
    address: overrides.address ?? "Via Roma 1, Milano",
    isVerified: true,
    rating: 4.8,
    ...overrides,
  };
}

/* ─── Context ────────────────────────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  loginWithPhone: async () => {},
  registerCustomer: async () => {},
  registerProvider: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ── On mount: restore session ─────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        /* Try to restore from stored user JSON first (instant render) */
        const cached = await AsyncStorage.getItem(USER_KEY);
        if (cached) setUser(JSON.parse(cached));

        /* Then verify token is still valid via /auth/me */
        const token = await TokenStore.getAccess();
        if (token) {
          try {
            const fresh = await AuthService.me();
            const u = apiUserToUser(fresh);
            setUser(u);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
            /* Re-establish WS connection after app restart */
            realtimeClient.connect().catch(() => {});
          } catch {
            /* Token invalid — clear it but keep cached user for UX */
            await TokenStore.clear();
          }
        }
      } catch {
        /* AsyncStorage failure — proceed as guest */
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveUser = async (u: User) => {
    setUser(u);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  /* ── Login ───────────────────────────────────────────────────────────────────── */
  const login = async (email: string, password: string) => {
    try {
      const apiUser = await AuthService.login(email, password);
      await saveUser(apiUserToUser(apiUser));
      realtimeClient.connect().catch(() => {});
    } catch (err: any) {
      /* If API unreachable (network error), fall back to demo mode */
      if (!err?.status) {
        const u = mockUser({ email, userType: "customer" });
        await saveUser(u);
        return;
      }
      throw err;
    }
  };

  /* ── Social Login (mock-backed, registers in DB with random password) ────────── */
  const loginWithGoogle = async () => {
    const email = `google_${generateId()}@curavicino.it`;
    try {
      const apiUser = await AuthService.registerCustomer({
        email,
        password: generateId(),
        fullName: "Marco Bianchi",
        phone: "+39 348 123 4567",
      });
      await saveUser(apiUserToUser(apiUser));
      realtimeClient.connect().catch(() => {});
    } catch {
      await saveUser(mockUser({ fullName: "Marco Bianchi", email, userType: "customer" }));
    }
  };

  const loginWithFacebook = async () => {
    const email = `fb_${generateId()}@curavicino.it`;
    try {
      const apiUser = await AuthService.registerCustomer({
        email,
        password: generateId(),
        fullName: "Giulia Ferrari",
        phone: "+39 340 987 6543",
      });
      await saveUser(apiUserToUser(apiUser));
      realtimeClient.connect().catch(() => {});
    } catch {
      await saveUser(mockUser({ fullName: "Giulia Ferrari", email, userType: "customer" }));
    }
  };

  const loginWithPhone = async (phone: string) => {
    const email = `phone_${generateId()}@curavicino.it`;
    try {
      const apiUser = await AuthService.registerCustomer({
        email,
        password: generateId(),
        fullName: "Luca Verdi",
        phone,
      });
      await saveUser(apiUserToUser(apiUser));
      realtimeClient.connect().catch(() => {});
    } catch {
      await saveUser(mockUser({ fullName: "Luca Verdi", phone, userType: "customer" }));
    }
  };

  /* ── Register ─────────────────────────────────────────────────────────────────── */
  const registerCustomer = async (data: Partial<User> & { password?: string }) => {
    try {
      const apiUser = await AuthService.registerCustomer({
        email: data.email ?? `user_${generateId()}@curavicino.it`,
        password: data.password ?? generateId(),
        fullName: data.fullName ?? "",
        phone: data.phone ?? "",
        age: data.age,
        address: data.address,
        forFamilyMember: data.forFamilyMember,
      });
      await saveUser(apiUserToUser(apiUser));
      realtimeClient.connect().catch(() => {});
    } catch (err: any) {
      if (!err?.status) {
        /* Network error → offline demo */
        await saveUser(mockUser({ ...data, userType: "customer", isVerified: true }));
        return;
      }
      throw err;
    }
  };

  const registerProvider = async (data: Partial<User> & { password?: string }) => {
    try {
      const apiUser = await AuthService.registerProvider({
        email: data.email ?? `provider_${generateId()}@curavicino.it`,
        password: data.password ?? generateId(),
        fullName: data.fullName ?? "",
        phone: data.phone ?? "",
        withdrawalPreference: data.withdrawalPreference,
      });
      const u = apiUserToUser(apiUser);
      u.qrCode = generateId();
      await saveUser(u);
      realtimeClient.connect().catch(() => {});
    } catch (err: any) {
      if (!err?.status) {
        await saveUser(
          mockUser({ ...data, userType: "provider", isVerified: false, qrCode: generateId() })
        );
        return;
      }
      throw err;
    }
  };

  /* ── Logout ──────────────────────────────────────────────────────────────────── */
  const logout = async () => {
    realtimeClient.disconnect();
    await AuthService.logout();
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  };

  /* ── Update local user ───────────────────────────────────────────────────────── */
  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    saveUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithFacebook,
        loginWithPhone,
        registerCustomer,
        registerProvider,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
