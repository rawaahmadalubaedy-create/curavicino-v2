import { Router } from "express";
import { z } from "zod";
import { db, messagesTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

const SendMessageSchema = z.object({
  receiverId: z.string(),
  bookingId: z.string().optional(),
  content: z.string().min(1).max(2000),
});

/* GET /api/messages?withUserId=xxx — conversation thread */
router.get("/messages", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const withUserId = req.query.withUserId as string | undefined;

    let rows;
    if (withUserId) {
      rows = await db
        .select()
        .from(messagesTable)
        .where(
          or(
            and(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, withUserId)),
            and(eq(messagesTable.senderId, withUserId), eq(messagesTable.receiverId, userId))
          )
        );
    } else {
      rows = await db
        .select()
        .from(messagesTable)
        .where(or(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, userId)));
    }

    res.json(
      rows.map((r) => ({
        id: r.id,
        senderId: r.senderId,
        receiverId: r.receiverId,
        bookingId: r.bookingId,
        content: r.content,
        read: r.read,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* POST /api/messages */
router.post("/messages", requireAuth, async (req, res) => {
  const parse = SendMessageSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const userId = (req as any).user.sub;
  const data = parse.data;

  try {
    const [message] = await db
      .insert(messagesTable)
      .values({
        id: generateId(),
        senderId: userId,
        receiverId: data.receiverId,
        bookingId: data.bookingId,
        content: data.content,
        read: false,
      })
      .returning();

    res.status(201).json({
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      bookingId: message.bookingId,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* PATCH /api/messages/:id/read */
router.patch("/messages/:id/read", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const msgId = String(req.params.id);
    await db
      .update(messagesTable)
      .set({ read: true })
      .where(and(eq(messagesTable.id, msgId), eq(messagesTable.receiverId, userId)));
    res.json({ ok: true });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
