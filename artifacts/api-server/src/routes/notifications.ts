import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

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

export default router;
