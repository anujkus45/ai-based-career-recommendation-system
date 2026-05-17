import { Router, type IRouter } from "express";
import { db, userProfilesTable, savedItemsTable, assessmentsTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";

const router: IRouter = Router();

const ALLOWED_KINDS = new Set(["career", "college", "scholarship", "roadmap"]);
const ALLOWED_CLASS = new Set(["9-10", "11-12", "ug", "grad"]);

router.get("/profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const rows = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, req.user.id)).limit(1);
    res.json({ profile: rows[0] ?? null });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

router.put("/profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const body = req.body ?? {};
    const classLevel = typeof body.classLevel === "string" && ALLOWED_CLASS.has(body.classLevel) ? body.classLevel : undefined;
    const stream = typeof body.stream === "string" ? body.stream.slice(0, 60) : undefined;
    const interests = Array.isArray(body.interests) ? body.interests.filter((s: unknown): s is string => typeof s === "string").slice(0, 12) : undefined;
    const preferredCareers = Array.isArray(body.preferredCareers) ? body.preferredCareers.filter((s: unknown): s is string => typeof s === "string").slice(0, 12) : undefined;
    const hasCompletedOnboarding = typeof body.hasCompletedOnboarding === "boolean" ? body.hasCompletedOnboarding : undefined;

    const userId = req.user.id;
    const existing = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, userId)).limit(1);
    if (existing.length === 0) {
      const [created] = await db.insert(userProfilesTable).values({
        userId,
        classLevel: classLevel ?? null,
        stream: stream ?? null,
        interests: interests ?? [],
        preferredCareers: preferredCareers ?? [],
        hasCompletedOnboarding: hasCompletedOnboarding ?? false,
      }).returning();
      res.json({ profile: created });
      return;
    }
    const updates: Record<string, unknown> = {};
    if (classLevel !== undefined) updates.classLevel = classLevel;
    if (stream !== undefined) updates.stream = stream;
    if (interests !== undefined) updates.interests = interests;
    if (preferredCareers !== undefined) updates.preferredCareers = preferredCareers;
    if (hasCompletedOnboarding !== undefined) updates.hasCompletedOnboarding = hasCompletedOnboarding;
    const [updated] = await db.update(userProfilesTable).set(updates).where(eq(userProfilesTable.userId, userId)).returning();
    res.json({ profile: updated });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/saved-items", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const rows = await db.select().from(savedItemsTable).where(eq(savedItemsTable.userId, req.user.id)).orderBy(desc(savedItemsTable.createdAt)).limit(50);
    res.json({ items: rows });
  } catch (err) {
    console.error("Get saved error:", err);
    res.status(500).json({ error: "Failed to load saved items" });
  }
});

router.post("/saved-items", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const body = req.body ?? {};
    const kind = typeof body.kind === "string" && ALLOWED_KINDS.has(body.kind) ? body.kind : null;
    const title = typeof body.title === "string" ? body.title.slice(0, 200) : null;
    if (!kind || !title) {
      res.status(400).json({ error: "kind and title required" });
      return;
    }
    const [created] = await db.insert(savedItemsTable).values({
      userId: req.user.id,
      kind,
      title,
      payload: body.payload ?? null,
    }).returning();
    res.json({ item: created });
  } catch (err) {
    console.error("Save item error:", err);
    res.status(500).json({ error: "Failed to save item" });
  }
});

router.delete("/saved-items/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    await db.delete(savedItemsTable).where(and(eq(savedItemsTable.id, id), eq(savedItemsTable.userId, req.user.id)));
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete saved error:", err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

router.get("/activity", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const userId = req.user.id;
    const [assessments, saved] = await Promise.all([
      db.select().from(assessmentsTable).where(eq(assessmentsTable.userId, userId)).orderBy(desc(assessmentsTable.createdAt)).limit(20),
      db.select().from(savedItemsTable).where(eq(savedItemsTable.userId, userId)).orderBy(desc(savedItemsTable.createdAt)).limit(20),
    ]);
    const events = [
      ...assessments.map((a) => ({ kind: "assessment", title: a.careerTitle, score: a.matchScore, at: a.createdAt })),
      ...saved.map((s) => ({ kind: `saved:${s.kind}`, title: s.title, at: s.createdAt })),
    ].sort((a, b) => new Date(b.at as unknown as string).getTime() - new Date(a.at as unknown as string).getTime()).slice(0, 25);
    res.json({ events });
  } catch (err) {
    console.error("Activity error:", err);
    res.status(500).json({ error: "Failed to load activity" });
  }
});

export default router;
