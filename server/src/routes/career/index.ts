import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetCareerRecommendationBody } from "@workspace/api-zod";
import { careerQuestions } from "./questions";
import { db, assessmentsTable } from "@workspace/db";
import { buildUserContext, formatUserContextPrompt } from "../../services/user";

const router: IRouter = Router();

router.get("/career/questions", (_req, res) => {
  res.json({ questions: careerQuestions });
});

router.post("/career/recommend", async (req, res) => {
  try {
    const parsed = GetCareerRecommendationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { answers } = parsed.data;

    const answerSummary = answers
      .map((a) => {
        const question = careerQuestions.find((q) => q.id === a.questionId);
        if (!question) return null;
        const option = question.options.find((o) => o.value === a.answer);
        return `${question.question}: ${option?.label ?? a.answer}`;
      })
      .filter(Boolean)
      .join("\n");

    const personalisation = req.isAuthenticated()
      ? formatUserContextPrompt(await buildUserContext(req.user.id))
      : "";

    const prompt = `You are an advanced AI career counselor specializing in the Indian education system. Your task is to recommend the BEST possible career for a student based on their assessment answers.

⚠️ ANTI-BIAS INSTRUCTIONS (STRICT):
- Do NOT default to Technology careers.
- Do NOT over-prioritize AI, Software, or IT roles.
- You MUST evaluate ALL career domains equally.

📊 CAREER DOMAINS TO CONSIDER:
1. Technology (Software, AI, Data, Cybersecurity)
2. Medical & Science (Doctor, Research, Biotech)
3. Commerce & Finance (CA, Banking, Investment, MBA)
4. Government Jobs (UPSC, SSC, Banking, Railways, Defence)
5. Law & Judiciary (Lawyer, Judge, Legal Advisor)
6. Creative Fields (Design, Film, Writing, Animation)
7. Business & Entrepreneurship
8. Sales & Marketing
9. Education & Social Work

🧠 DECISION LOGIC:
Analyze the student's Profile:
• Interests & Academics
• Strengths & Work style
• Life Goals & Environment preferences

Selection Rules:
- If Government, Law, Commerce, or Non-Tech fits better based on their profile → MUST recommend that.
- If user prefers stability or low risk → prioritize Govt / CA / Banking.
- If user prefers authority/power → prioritize UPSC / Defence / Law.
- If user prefers high income & communication → consider Sales/Business.
- If user prefers creativity → prioritize Creative fields.
- ONLY recommend Tech if strongly justified by technical interests and computer science background.

Student's Assessment Answers:
${answerSummary}${personalisation}

Respond ONLY with a valid JSON object (no markdown, no code blocks) in professional English with this exact structure:
{
  "careerTitle": "Exact Career Name",
  "matchScore": 0-100 score,
  "matchScoreBreakdown": "2-3 sentence explanation of how this score was calculated (e.g., 'Your strong interest in science (40%) combined with your logical problem-solving style (30%) and preference for healthcare settings (22%) results in a 92% match.')",
  "description": "2-3 sentence overview of the role",
  "whyGoodFit": "Reasoning mapped to user's strengths and goals",
  "salaryRange": "Entry to Senior level in INR (e.g., ₹5-12 LPA entry, ₹25-60 LPA senior)",
  "jobOutlook": "Description of market demand and future prospects",
  "futureProofScore": 0-100 score,
  "aiReplacementRisk": "Low | Medium | High",
  "aiRiskExplanation": "How AI impacts this specific role in the next decade",
  "topCities": ["City 1", "City 2", "City 3"],
  "keySkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "alternativeCareers": ["Non-tech Career 1", "Non-tech Career 2", "Other Domain Career 3"],
  "roadmap": [
    {
      "phase": "Phase 1",
      "title": "Foundation (e.g., Class 11-12)",
      "description": "What to focus on",
      "duration": "Time period",
      "skills": ["Skill 1", "Skill 2"],
      "resources": ["Specific Indian exam/platform 1", "Resource 2"]
    },
    {
      "phase": "Phase 2",
      "title": "Higher Education",
      "description": "Degrees and colleges",
      "duration": "3-4 years",
      "skills": ["Skill 1", "Skill 2"],
      "resources": ["Exams like JEE/NEET/CLAT/CAT", "Specific colleges"]
    },
    { "phase": "Phase 3", "title": "Entry Level", "description": "Internships/First jobs", "duration": "1-2 years", "skills": [], "resources": [] },
    { "phase": "Phase 4", "title": "Growth", "description": "Advancement path", "duration": "3-5 years", "skills": [], "resources": [] },
    { "phase": "Phase 5", "title": "Expertise/Leadership", "description": "Senior roles", "duration": "Ongoing", "skills": [], "resources": [] }
  ]
}

Make sure the roadmap is specific and practical for an Indian student. Include real exams (JEE, NEET, UPSC, SSC, CLAT, CAT, etc.), specific colleges/courses, and real platforms (Coursera, NPTEL, etc.).`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an advanced AI career counselor for Indian students. You provide unbiased, professional advice in professional English. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
    });


    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    let recommendation;
    try {
      recommendation = JSON.parse(content.trim());
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        res.status(500).json({ error: "Invalid AI response format" });
        return;
      }
      recommendation = JSON.parse(jsonMatch[0]);
    }

    // Auto-save the assessment result if user is authenticated
    if (req.isAuthenticated()) {
      try {
        await db.insert(assessmentsTable).values({
          userId: req.user.id,
          careerTitle: recommendation.careerTitle,
          matchScore: recommendation.matchScore,
          result: recommendation,
        });
      } catch (saveErr) {
        console.warn("Failed to save assessment (non-critical):", saveErr);
      }
    }

    res.json(recommendation);
  } catch (err: any) {
    console.error("Career recommendation error:", err);
    if (err?.status === 401) {
      res.status(503).json({ error: "AI Service is temporarily unavailable due to missing or invalid configuration." });
    } else {
      res.status(500).json({ error: "Failed to generate recommendation" });
    }
  }
});

router.post("/career/chat", async (req, res) => {
  try {
    const { message, recommendation, history } = req.body;

    if (!message || !recommendation) {
      res.status(400).json({ error: "Message and recommendation context are required" });
      return;
    }

    const personalisation = req.isAuthenticated()
      ? formatUserContextPrompt(await buildUserContext(req.user.id))
      : "";

    const systemPrompt = `### MANDATORY SYSTEM INSTRUCTION ###
STRICTLY FORBIDDEN: Do NOT answer any questions about weather, news, recipes, politics, general knowledge, or anything UNRELATED to the specific career recommended below.

Current Career Context:
- Career Title: ${recommendation.careerTitle}
- Recommended for: ${personalisation}

YOUR ROLE:
You are ONLY allowed to act as a career counselor for the career: ${recommendation.careerTitle}.
Answer questions ONLY about:
1. Colleges/Universities for this career in India.
2. Entrance exams or eligibility for this career.
3. Salary, job outlook, and career progression.
4. Skills and resources needed.

IF USER ASKS ANYTHING OFF-TOPIC:
You MUST politely refuse. Example: "I apologize, but my expertise is limited to your career path in **${recommendation.careerTitle}**. I cannot answer questions about [user's topic]. Let's discuss your career instead!"

FORMATTING:
- Be concise (2-3 short paragraphs max).
- Use bullet points.
- NO tables.
- Bold key terms.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { 
        role: "user", 
        content: `IMPORTANT: Answer ONLY if the following question is about my career path in ${recommendation.careerTitle}. Otherwise, reject it politely as per your system instructions.\n\nUser Question: ${message}` 
      },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o",
      messages: messages as any,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    res.json({ reply });
  } catch (err: any) {
    console.error("Career chat error:", err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

export default router;
