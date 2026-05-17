import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/cost/estimate", async (req, res) => {
  try {
    const career = String(req.body?.career ?? "").trim();
    if (career.length < 2 || career.length > 80) {
      res.status(400).json({ error: "Career name is required (2-80 chars)" });
      return;
    }

    const prompt = `You are an Indian education finance expert. For the career "${career}", give a complete cost & scholarship breakdown.

Respond ONLY with valid JSON in this exact structure:
{
  "career": "${career}",
  "courseName": "Most common degree/course (e.g., B.Tech CSE, MBBS, B.Com + CA)",
  "courseDuration": "Total years (e.g., 4 years, 5.5 years)",
  "totalCostEstimate": "Total cost range across the entire course in INR (e.g., ₹1.5L - ₹40L)",
  "feeBreakdown": [
    {
      "tier": "Government / IIT / AIIMS / Top Public",
      "annualFee": "₹X - ₹Y per year",
      "totalFee": "₹X - ₹Y for full course",
      "examples": ["College 1", "College 2", "College 3"],
      "notes": "1-line note about admission"
    },
    {
      "tier": "Tier-1 Private",
      "annualFee": "₹X - ₹Y per year",
      "totalFee": "₹X - ₹Y for full course",
      "examples": ["College 1", "College 2", "College 3"],
      "notes": "1-line note"
    },
    {
      "tier": "Tier-2 / Affordable Private",
      "annualFee": "₹X - ₹Y per year",
      "totalFee": "₹X - ₹Y for full course",
      "examples": ["College 1", "College 2", "College 3"],
      "notes": "1-line note"
    }
  ],
  "additionalCosts": [
    { "item": "Hostel & Mess", "cost": "₹X - ₹Y per year" },
    { "item": "Books & Materials", "cost": "₹X - ₹Y" },
    { "item": "Coaching (if needed)", "cost": "₹X - ₹Y" }
  ],
  "scholarships": [
    {
      "name": "Real scholarship name (e.g., National Scholarship Portal - Post Matric)",
      "provider": "Government / Private body",
      "eligibility": "Who can apply (income limit, category, marks)",
      "amount": "₹X per year",
      "applyAt": "Website or process (e.g., scholarships.gov.in)"
    }
  ],
  "educationLoans": [
    {
      "scheme": "Real loan scheme (e.g., SBI Scholar Loan / Vidya Lakshmi Portal)",
      "maxAmount": "Up to ₹X (India) / ₹Y (Abroad)",
      "interestRate": "X% - Y% per year",
      "moratorium": "Repayment starts after course + X months",
      "collateral": "Required above ₹X | Not required up to ₹Y",
      "notes": "Key benefit (e.g., subsidy under CSIS for income < ₹4.5L)"
    }
  ],
  "smartTips": [
    "Practical money-saving tip 1",
    "Practical money-saving tip 2",
    "Practical money-saving tip 3",
    "Practical money-saving tip 4"
  ],
  "roiSummary": "2-3 sentence ROI analysis: how many years to recover investment based on starting salary"
}

Include AT LEAST 5 real scholarships (mix of government like NSP, INSPIRE, PM Vidyalaxmi, Means-cum-Merit, and private like Reliance Foundation, Tata, Aditya Birla). Include 3+ real education loan schemes. Use ACTUAL Indian college names and ACTUAL fee numbers in INR. Be specific to the career chosen.`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an Indian education finance counselor. Respond with valid JSON only." },
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
    console.error("Cost estimate error:", err);
    res.status(500).json({ error: "Failed to estimate cost" });
  }
});

export default router;
