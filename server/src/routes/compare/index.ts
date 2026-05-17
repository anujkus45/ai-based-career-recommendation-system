import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/compare/careers", async (req, res) => {
  try {
    const careerA = String(req.body?.careerA ?? "").trim();
    const careerB = String(req.body?.careerB ?? "").trim();
    if (careerA.length < 2 || careerB.length < 2 || careerA.length > 80 || careerB.length > 80) {
      res.status(400).json({ error: "Both career names are required (2-80 chars)" });
      return;
    }

    const prompt = `Compare these two careers for an Indian student: "${careerA}" vs "${careerB}".

Respond ONLY with valid JSON in this exact structure:
{
  "careerA": {
    "name": "${careerA}",
    "tagline": "Short 1-line summary",
    "salaryEntry": "Entry salary in INR LPA",
    "salarySenior": "Senior salary in INR LPA",
    "yearsToJob": 5,
    "difficultyScore": 8,
    "stressLevel": 7,
    "workLifeBalance": 6,
    "jobSecurity": 9,
    "futureProofScore": 8,
    "aiReplacementRisk": "Low | Medium | High",
    "topSkills": ["skill1", "skill2", "skill3", "skill4"],
    "pros": ["pro1", "pro2", "pro3"],
    "cons": ["con1", "con2", "con3"],
    "examPath": "Required exams (JEE/NEET/CAT etc.)",
    "topColleges": ["college1", "college2", "college3"]
  },
  "careerB": { same structure for ${careerB} },
  "verdict": {
    "winner": "${careerA} | ${careerB} | Tie",
    "summary": "2-3 sentence verdict explaining which is better and for whom",
    "chooseAIf": "1-line: choose ${careerA} if you...",
    "chooseBIf": "1-line: choose ${careerB} if you..."
  }
}

All scores should be on a 1-10 scale (10 is best for jobSecurity/balance/futureProof; 10 is hardest for difficultyScore/stressLevel). yearsToJob is total years from class 12 to first stable job. Use realistic Indian salary numbers.`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an Indian career counselor. Respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No AI response" });
      return;
    }

    res.json(JSON.parse(content.trim()));
  } catch (err) {
    console.error("Career compare error:", err);
    res.status(500).json({ error: "Failed to compare careers" });
  }
});

export default router;
