import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  registerCustomer: (data: Partial<User>) => Promise<void>;
  registerProvider: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

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

  useEffect(() => {
    AsyncStorage.getItem("curavicino_user").then((v) => {
      if (v) setUser(JSON.parse(v));
      setIsLoading(false);
    });
  }, []);

  const saveUser = async (u: User) => {
    setUser(u);
    await AsyncStorage.setItem("curavicino_user", JSON.stringify(u));
  };

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const login = async (email: string, _password: string) => {
    const u: User = {
      id: generateId(),
      fullName: "Mario Rossi",
      email,
      phone: "+39 345 678 9012",
      userType: "customer",
      age: 45,
      address: "Via Roma 1, Milano",
      isVerified: true,
      rating: 4.8,
    };
    await saveUser(u);
  };

  const loginWithGoogle = async () => {
    const u: User = {
      id: generateId(),
      fullName: "Marco Bianchi",
      email: "marco@gmail.com",
      phone: "+39 348 123 4567",
      userType: "customer",
      isVerified: true,
      rating: 4.5,
    };
    await saveUser(u);
  };

  const loginWithFacebook = async () => {
    const u: User = {
      id: generateId(),
      fullName: "Giulia Ferrari",
      email: "giulia@facebook.com",
      phone: "+39 340 987 6543",
      userType: "customer",
      isVerified: true,
      rating: 4.7,
    };
    await saveUser(u);
  };

  const loginWithPhone = async (phone: string) => {
    const u: User = {
      id: generateId(),
      fullName: "Luca Verdi",
      email: "luca@example.com",
      phone,
      userType: "customer",
      isVerified: true,
    };
    await saveUser(u);
  };

  const registerCustomer = async (data: Partial<User>) => {
    const u: User = {
      id: generateId(),
      fullName: data.fullName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      userType: "customer",
      age: data.age,
      address: data.address,
      forFamilyMember: data.forFamilyMember,
      isVerified: true,
    };
    await saveUser(u);
  };

  const registerProvider = async (data: Partial<User>) => {
    const u: User = {
      id: generateId(),
      fullName: data.fullName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      userType: "provider",
      isVerified: false,
      withdrawalPreference: data.withdrawalPreference ?? "weekly",
      bankLinked: false,
      qrCode: generateId(),
    };
    await saveUser(u);
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("curavicino_user");
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUser(updated);
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
