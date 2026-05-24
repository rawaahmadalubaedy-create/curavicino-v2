import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { realtime } from "../lib/realtime";
import { generateId } from "../lib/id";

const router = Router();

/* GET /api/notifications */
router.get("/notifications", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId));

    res.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        message: r.message,
        type: r.type,
        read: r.read,
        time: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* PATCH /api/notifications/:id/read */
router.patch("/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const notifId = String(req.params.id);
    const [row] = await db
      .select({ id: notificationsTable.id })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.id, notifId),
          eq(notificationsTable.userId, userId)
        )
      )
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, notifId));

    res.json({ ok: true });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* PATCH /api/notifications/read-all */
router.patch("/notifications/read-all", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.userId, userId));
    res.json({ ok: true });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/notifications — internal: push a notification to a user (admin/system) */
router.post("/notifications", requireAuth, async (req, res) => {
  const { targetUserId, title, message, type } = req.body ?? {};
  if (!targetUserId || !title || !message) {
    res.status(400).json({ error: "targetUserId, title, message required" });
    return;
  }

  try {
    const id = generateId();
    await db.insert(notificationsTable).values({
      id,
      userId: targetUserId,
      title,
      message,
      type: type ?? "system",
      read: false,
    });

    /* Push real-time */
    realtime.emitToUser(targetUserId, {
      type: "new_notification",
      data: { id, title, message, type: type ?? "system", read: false, time: new Date().toISOString() },
    });

    res.status(201).json({ id });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
