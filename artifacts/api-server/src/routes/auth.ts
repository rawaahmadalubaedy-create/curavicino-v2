import { Router } from "express";
import { z } from "zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  comparePassword,
  signAccess,
  signRefresh,
  verifyToken,
  requireAuth,
} from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().default(""),
  userType: z.enum(["customer", "provider"]).default("customer"),
  age: z.number().int().optional(),
  address: z.string().optional(),
  forFamilyMember: z.boolean().optional(),
  withdrawalPreference: z.enum(["daily", "weekly", "monthly"]).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/auth/register", async (req, res) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
    return;
  }
  const data = parse.data;

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(data.password);
  const id = generateId();

  const [user] = await db
    .insert(usersTable)
    .values({
      id,
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      userType: data.userType,
      age: data.age,
      address: data.address,
      forFamilyMember: data.forFamilyMember ?? false,
      withdrawalPreference: data.withdrawalPreference ?? "weekly",
      isVerified: data.userType === "customer",
    })
    .returning();

  const payload = { sub: user.id, userType: user.userType, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      userType: user.userType,
      isVerified: user.isVerified,
      age: user.age,
      address: user.address,
      forFamilyMember: user.forFamilyMember,
      withdrawalPreference: user.withdrawalPreference,
      bankLinked: user.bankLinked,
    },
  });
});

router.post("/auth/login", async (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parse.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const payload = { sub: user.id, userType: user.userType, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      userType: user.userType,
      isVerified: user.isVerified,
      age: user.age,
      address: user.address,
      forFamilyMember: user.forFamilyMember,
      withdrawalPreference: user.withdrawalPreference,
      bankLinked: user.bankLinked,
      photo: user.photo,
    },
  });
});

router.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken || typeof refreshToken !== "string") {
    res.status(400).json({ error: "refreshToken required" });
    return;
  }
  try {
    const payload = verifyToken(refreshToken);
    const [user] = await db
      .select({ id: usersTable.id, userType: usersTable.userType, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, payload.sub))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    const newPayload = { sub: user.id, userType: user.userType, email: user.email };
    res.json({ accessToken: signAccess(newPayload) });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const jwtUser = (req as any).user;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, jwtUser.sub))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    userType: user.userType,
    isVerified: user.isVerified,
    age: user.age,
    address: user.address,
    forFamilyMember: user.forFamilyMember,
    withdrawalPreference: user.withdrawalPreference,
    bankLinked: user.bankLinked,
    photo: user.photo,
  });
});

export default router;
