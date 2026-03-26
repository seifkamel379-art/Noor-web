import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable, insertReviewSchema } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

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
    const [review] = await db.insert(reviewsTable).values(parsed.data).returning();
    res.status(201).json({
      id: review.id,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create review");
    res.status(500).json({ error: "Failed to create review" });
  }
});

export default router;
