import { apiFetch, TokenStore } from "./api";

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  userType: "customer" | "provider" | "admin";
  isVerified: boolean;
  age?: number;
  address?: string;
  forFamilyMember?: boolean;
  withdrawalPreference?: "daily" | "weekly" | "monthly";
  bankLinked?: boolean;
  photo?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export interface RegisterCustomerParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  age?: number;
  address?: string;
  forFamilyMember?: boolean;
}

export interface RegisterProviderParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  withdrawalPreference?: "daily" | "weekly" | "monthly";
}

async function saveTokens(res: AuthResponse): Promise<void> {
  await TokenStore.setAccess(res.accessToken);
  await TokenStore.setRefresh(res.refreshToken);
}

export const AuthService = {
  async login(email: string, password: string): Promise<ApiUser> {
    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await saveTokens(res);
    return res.user;
  },

  async registerCustomer(params: RegisterCustomerParams): Promise<ApiUser> {
    const res = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { ...params, userType: "customer" },
      auth: false,
    });
    await saveTokens(res);
    return res.user;
  },

  async registerProvider(params: RegisterProviderParams): Promise<ApiUser> {
    const res = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { ...params, userType: "provider" },
      auth: false,
    });
    await saveTokens(res);
    return res.user;
  },

  async me(): Promise<ApiUser> {
    return apiFetch<ApiUser>("/auth/me");
  },

  async logout(): Promise<void> {
    await TokenStore.clear();
  },
};
