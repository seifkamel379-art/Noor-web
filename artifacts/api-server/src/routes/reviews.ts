import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable, insertReviewSchema } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    res.json(reviews.map(r => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to fetch reviews");
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/reviews", async (req, res) => {
  const parsed = insertReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid data" });
    return;
  }
  try {
    const token = randomUUID();
    const [review] = await db.insert(reviewsTable).values({ ...parsed.data, token }).returning();
    res.status(201).json({
      id: review.id,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      token: review.token,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create review");
    res.status(500).json({ error: "Failed to create review" });
  }
});

router.patch("/reviews/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { token, name, rating, comment } = req.body as { token?: string; name?: string; rating?: number; comment?: string };

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [existing] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    if (existing.token !== token) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const updates: Partial<{ name: string; rating: number; comment: string }> = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (rating !== undefined) updates.rating = Number(rating);
    if (comment !== undefined) updates.comment = String(comment).trim();

    const [updated] = await db.update(reviewsTable).set(updates).where(eq(reviewsTable.id, id)).returning();
    res.json({
      id: updated.id,
      name: updated.name,
      rating: updated.rating,
      comment: updated.comment,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update review");
    res.status(500).json({ error: "Failed to update review" });
  }
});

router.delete("/reviews/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { token } = req.body as { token?: string };

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [existing] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    if (existing.token !== token) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete review");
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
