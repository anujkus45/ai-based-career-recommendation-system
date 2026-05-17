import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

export const streamQuestions = [
  {
    id: "favorite_subject",
    question: "Which subjects do you enjoy the most?",
    options: [
      { value: "math_science", label: "Math & Science (Physics, Chemistry, Biology)" },
      { value: "business_econ", label: "Business, Economics & Accounts" },
      { value: "humanities", label: "History, Languages, Sociology" },
      { value: "creative", label: "Art, Design, Music, Drama" },
    ],
  },
  {
    id: "thinking_style",
    question: "How do you naturally think and solve problems?",
    options: [
      { value: "logical", label: "Logically with formulas and analysis" },
      { value: "strategic", label: "Strategically — comparing pros & cons" },
      { value: "expressive", label: "Through stories, words, and ideas" },
      { value: "visual", label: "Visually — sketches, designs, imagination" },
    ],
  },
  {
    id: "future_career",
    question: "What kind of career excites you most?",
    options: [
      { value: "doctor_engineer", label: "Doctor, Engineer, Scientist, Researcher" },
      { value: "ca_mba", label: "CA, MBA, Banker, Entrepreneur" },
      { value: "law_civil", label: "Lawyer, Journalist, IAS/IPS, Teacher" },
      { value: "designer_artist", label: "Designer, Filmmaker, Animator, Game Developer" },
    ],
  },
  {
    id: "exam_comfort",
    question: "Which entrance exams interest you?",
    options: [
      { value: "jee_neet", label: "JEE / NEET / NDA" },
      { value: "cuet_cat", label: "CUET / CAT / CA Foundation" },
      { value: "clat_upsc", label: "CLAT / UPSC / Mass Comm exams" },
      { value: "nift_nid", label: "NIFT / NID / Design entrance" },
    ],
  },
  {
    id: "study_pref",
    question: "What kind of work do you enjoy doing?",
    options: [
      { value: "experiments", label: "Doing experiments and solving puzzles" },
      { value: "money_market", label: "Tracking trends, money, and markets" },
      { value: "writing_debate", label: "Writing essays and debating ideas" },
      { value: "creating", label: "Creating, building, designing things" },
    ],
  },
];

router.get("/stream/questions", (_req, res) => {
  res.json({ questions: streamQuestions });
});

router.post("/stream/recommend", async (req, res) => {
  try {
    const answers = (req.body?.answers ?? []) as Array<{ questionId: string; answer: string }>;
    if (!Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const summary = answers
      .map((a) => {
        const q = streamQuestions.find((x) => x.id === a.questionId);
        const opt = q?.options.find((o) => o.value === a.answer);
        return q ? `${q.question}: ${opt?.label ?? a.answer}` : null;
      })
      .filter(Boolean)
      .join("\n");

    const prompt = `You are a career counselor for Indian students. Based on the following answers from a class 9-10 student, recommend the BEST stream for them in class 11-12 (Science / Commerce / Arts/Humanities).

Student's Answers:
${summary}

Respond ONLY with valid JSON in this exact structure:
{
  "recommendedStream": "Science | Commerce | Arts/Humanities",
  "matchScore": 89,
  "subjectsToPick": ["Subject 1", "Subject 2", "Subject 3", "Subject 4"],
  "reasoning": "2-3 sentence explanation of why this stream fits this student",
  "topCareers": ["Career 1", "Career 2", "Career 3", "Career 4", "Career 5"],
  "entranceExams": ["Exam 1 - what it leads to", "Exam 2 - what it leads to", "Exam 3 - what it leads to"],
  "alternativeStream": {
    "name": "Second-best stream",
    "matchScore": 72,
    "reasoning": "Why this could also work as a backup"
  },
  "warnings": ["Common mistake or thing to avoid 1", "Thing to avoid 2"],
  "actionPlan": ["Step 1 to take now", "Step 2", "Step 3", "Step 4"]
}

Be specific to the Indian education system (CBSE/ICSE/State Board). Mention real subjects, real exams (JEE/NEET/CUET/CA Foundation/CLAT), and real career paths.`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an Indian education stream counselor. Respond with valid JSON only." },
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
    console.error("Stream recommend error:", err);
    res.status(500).json({ error: "Failed to recommend stream" });
  }
});

export default router;
