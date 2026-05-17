import { Router, type IRouter } from "express";
import { db, assessmentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/assessments", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.userId, req.user.id))
      .orderBy(desc(assessmentsTable.createdAt))
      .limit(10);

    res.json({ assessments: rows });
  } catch (err) {
    console.error("Get assessments error:", err);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

export default router;
