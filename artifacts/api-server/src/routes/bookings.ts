import { Router } from "express";
import { z } from "zod";
import { db, bookingsTable, reviewsTable, providersTable, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/id";
import { realtime } from "../lib/realtime";

const router = Router();

const CreateBookingSchema = z.object({
  providerId: z.string(),
  providerName: z.string(),
  service: z.string(),
  category: z.string(),
  date: z.string(),
  time: z.string(),
  duration: z.number().int().min(1).default(1),
  totalCost: z.number(),
  notes: z.string().optional(),
});

const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().default(""),
  customerName: z.string().default(""),
  customerAvatar: z.string().optional(),
});

/* GET /api/bookings — current user's bookings */
router.get("/bookings", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const rows = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.customerId, userId));

    res.json(rows.map(bookingToDto));
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* GET /api/bookings/:id */
router.get("/bookings/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const bookingId = String(req.params.id);
    const [row] = await db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.customerId, userId)))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    const [review] = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.bookingId, row.id))
      .limit(1);

    res.json({
      ...bookingToDto(row),
      rating: review?.rating,
      review: review?.text,
    });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/bookings */
router.post("/bookings", requireAuth, async (req, res) => {
  const parse = CreateBookingSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
    return;
  }
  const userId = (req as any).user.sub;
  const data = parse.data;

  try {
    const id = generateId();
    const [booking] = await db
      .insert(bookingsTable)
      .values({
        id,
        customerId: userId,
        providerId: data.providerId,
        providerName: data.providerName,
        service: data.service,
        category: data.category,
        date: data.date,
        time: data.time,
        duration: data.duration,
        totalCost: data.totalCost,
        notes: data.notes,
        status: "pending",
      })
      .returning();

    /* Booking-confirmation notification */
    const notifId = generateId();
    await db.insert(notificationsTable).values({
      id: notifId,
      userId,
      title: "Booking Confirmed",
      message: `Your booking for ${data.service} with ${data.providerName} has been confirmed.`,
      type: "booking",
      read: false,
    });

    const dto = bookingToDto(booking);

    /* Real-time: notify customer */
    realtime.emitToUser(userId, {
      type: "booking_update",
      data: { ...dto, event: "created" },
    });
    realtime.emitToUser(userId, {
      type: "new_notification",
      data: {
        id: notifId,
        title: "Booking Confirmed",
        message: dto.service + " with " + dto.providerName,
        type: "booking",
        read: false,
        time: new Date().toISOString(),
      },
    });

    /* Real-time: also notify the provider (if online) */
    realtime.emitToUser(data.providerId, {
      type: "booking_update",
      data: { ...dto, event: "new_booking" },
    });

    res.status(201).json(dto);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* PATCH /api/bookings/:id/status */
router.patch("/bookings/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body ?? {};
  const validStatuses = ["pending", "active", "completed", "cancelled"] as const;
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const userId = (req as any).user.sub;
  const bookingId = String(req.params.id);

  try {
    const [row] = await db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.customerId, userId)))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    const [updated] = await db
      .update(bookingsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookingsTable.id, bookingId))
      .returning();

    const dto = bookingToDto(updated);

    /* Map status to a descriptive real-time event type */
    const eventTypeMap: Record<string, "booking_update" | "service_started" | "service_completed"> = {
      active: "service_started",
      completed: "service_completed",
      cancelled: "booking_update",
      pending: "booking_update",
    };
    const evType = eventTypeMap[status] ?? "booking_update";

    realtime.emitToUser(userId, { type: evType, data: { ...dto, event: status } });

    /* Wallet debit event on completion */
    if (status === "completed") {
      realtime.emitToUser(userId, {
        type: "wallet_update",
        data: {
          type: "debit",
          amount: row.totalCost,
          description: `Payment for ${row.service}`,
          bookingId: row.id,
        },
      });
    }

    res.json(dto);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/bookings/:id/review */
router.post("/bookings/:id/review", requireAuth, async (req, res) => {
  const parse = ReviewSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const userId = (req as any).user.sub;
  const data = parse.data;
  const bookingId = String(req.params.id);

  try {
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.customerId, userId)))
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (booking.status !== "completed") {
      res.status(400).json({ error: "Can only review completed bookings" });
      return;
    }

    const [existing] = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(eq(reviewsTable.bookingId, booking.id))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "Already reviewed" });
      return;
    }

    const [review] = await db
      .insert(reviewsTable)
      .values({
        id: generateId(),
        bookingId: booking.id,
        customerId: userId,
        providerId: booking.providerId,
        customerName: data.customerName,
        customerAvatar: data.customerAvatar ?? "",
        rating: data.rating,
        text: data.text,
      })
      .returning();

    /* Recalculate provider rating */
    const allReviews = await db
      .select({ rating: reviewsTable.rating })
      .from(reviewsTable)
      .where(eq(reviewsTable.providerId, booking.providerId));

    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await db
      .update(providersTable)
      .set({ rating: Math.round(avg * 10) / 10, reviewsCount: allReviews.length })
      .where(eq(providersTable.id, booking.providerId));

    res.status(201).json(review);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/bookings/:id/arrived — provider signals arrival */
router.post("/bookings/:id/arrived", requireAuth, async (req, res) => {
  try {
    const bookingId = String(req.params.id);
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, bookingId))
      .limit(1);

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    /* Notify the customer */
    const notifId = generateId();
    await db.insert(notificationsTable).values({
      id: notifId,
      userId: booking.customerId,
      title: "Provider Arrived",
      message: `${booking.providerName} has arrived at your location.`,
      type: "provider",
      read: false,
    });

    realtime.emitToUser(booking.customerId, {
      type: "provider_arrived",
      data: { bookingId, providerName: booking.providerName },
    });
    realtime.emitToUser(booking.customerId, {
      type: "new_notification",
      data: {
        id: notifId,
        title: "Provider Arrived",
        message: `${booking.providerName} has arrived.`,
        type: "provider",
        read: false,
        time: new Date().toISOString(),
      },
    });

    res.json({ ok: true });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function bookingToDto(row: typeof bookingsTable.$inferSelect) {
  return {
    id: row.id,
    providerId: row.providerId,
    providerName: row.providerName,
    service: row.service,
    category: row.category,
    status: row.status,
    date: row.date,
    time: row.time,
    duration: row.duration,
    totalCost: row.totalCost,
    notes: row.notes ?? undefined,
  };
}

export default router;
