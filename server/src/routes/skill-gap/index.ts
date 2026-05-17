import { Router, Request, Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

router.post("/get-skills", async (req: Request, res: Response) => {
  try {
    const { careerGoal } = req.body as { careerGoal: string };

    if (!careerGoal?.trim()) {
      res.status(400).json({ error: "Career goal is required" });
      return;
    }

    const prompt = `You are an expert career counselor for Indian students.
For the career goal: "${careerGoal}"

Return a JSON object with the 6-8 most important skills needed to succeed in this career.
For each skill include:
- name: skill name (short, 1-3 words)
- requiredLevel: number 0-100 representing mastery level needed
- description: one sentence explaining why this skill matters
- category: one of "Technical", "Conceptual", "Soft Skill", "Domain Knowledge"

Return ONLY valid JSON in this format:
{
  "careerGoal": "...",
  "skills": [
    {"name": "...", "requiredLevel": 80, "description": "...", "category": "..."},
    ...
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content ?? "{}";
    let result;
    try {
      result = JSON.parse(content.trim());
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        res.status(500).json({ error: "Invalid AI response format" });
        return;
      }
      result = JSON.parse(jsonMatch[0]);
    }

    res.json(result);
  } catch (err) {
    console.error("get-skills error:", err);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { careerGoal, currentSkills } = req.body as {
      careerGoal: string;
      currentSkills: { name: string; currentLevel: number; requiredLevel: number }[];
    };

    if (!careerGoal || !currentSkills?.length) {
      res.status(400).json({ error: "Career goal and skills are required" });
      return;
    }

    const skillSummary = currentSkills
      .map(
        (s) =>
          `${s.name}: Current=${s.currentLevel}/100, Required=${s.requiredLevel}/100, Gap=${Math.max(0, s.requiredLevel - s.currentLevel)}`,
      )
      .join("\n");

    const overallReadiness = Math.round(
      currentSkills.reduce(
        (sum, s) =>
          sum + Math.min(100, (s.currentLevel / s.requiredLevel) * 100),
        0,
      ) / currentSkills.length,
    );

    const prompt = `You are an expert career counselor for Indian students.

Career Goal: ${careerGoal}
Student's Current Readiness: ${overallReadiness}%

Skill Gap Analysis:
${skillSummary}

Based on these gaps, create a detailed personalized learning roadmap.

Return ONLY valid JSON in this format:
{
  "careerGoal": "${careerGoal}",
  "overallReadiness": ${overallReadiness},
  "estimatedTime": "X months / Y years",
  "skills": [
    {
      "name": "skill name",
      "currentLevel": 50,
      "requiredLevel": 80,
      "gap": 30,
      "priority": "High" | "Medium" | "Low",
      "resources": ["Resource 1", "Resource 2", "Resource 3"]
    }
  ],
  "roadmap": [
    {
      "phase": 1,
      "title": "Phase title",
      "duration": "X weeks/months",
      "skills": ["skill1", "skill2"],
      "actions": [
        "Specific actionable step 1",
        "Specific actionable step 2",
        "Specific actionable step 3"
      ]
    }
  ]
}

Rules:
- Create 3-5 phases ordered by priority (biggest gaps first)
- Give 3-5 specific, actionable steps per phase (mention specific courses, books, or projects for India)
- List 3 free/affordable resources per skill (YouTube channels, NPTEL, Coursera, Khan Academy, etc.)
- Estimate realistic time based on Indian student's schedule
- Priority: High = gap > 25, Medium = gap 10-25, Low = gap < 10`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = completion.choices[0].message.content ?? "{}";
    let result;
    try {
      result = JSON.parse(content.trim());
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        res.status(500).json({ error: "Invalid AI response format" });
        return;
      }
      result = JSON.parse(jsonMatch[0]);
    }

    res.json(result);
  } catch (err) {
    console.error("analyze error:", err);
    res.status(500).json({ error: "Failed to analyze skill gap" });
  }
});

export default router;
